/**
 * Lightning Invoice Parser and HTTP Call Handler
 *
 * This module handles parsing Lightning invoices to extract relay information
 * from the memo field and making HTTP calls after successful payments.
 */

import { decode as decodeBolt11 } from "light-bolt11-decoder"

export interface RelayConfig {
    relay: string
    httpHeader?: {
        key: string
        value: string | boolean | number
    }
}

export interface LightningInvoiceDetails {
    paymentHash?: string
    amount?: number
    amountMsat?: number
    description?: string
    descriptionHash?: string
    expiresAt?: Date
    createdAt?: Date
}

/**
 * Validates if a string is a valid Lightning invoice (BOLT11).
 *
 * @param invoice - The string to validate
 * @returns true if valid Lightning invoice, false otherwise
 */
export function isValidLightningInvoice(invoice: string): boolean {
    try {
        // Basic format check - Lightning invoices start with lnbc, lntb, or lnbcrt
        if (!invoice.toLowerCase().match(/^(lnbc|lntb|lnbcrt)/)) {
            return false
        }

        // Try to decode the invoice to verify it's valid
        const decoded = decodeBolt11(invoice)

        // Check if we got a valid decoded structure
        return decoded && decoded.sections && decoded.sections.length > 0
    } catch (error) {
        console.log("Invalid Lightning invoice:", error)
        return false
    }
}

/**
 * Parses a Lightning invoice to extract relay configuration from the memo field.
 * Uses light-bolt11-decoder to properly decode the BOLT11 invoice and extract
 * the description field which may contain JSON relay configuration.
 *
 * @param invoice - The BOLT11 Lightning invoice string
 * @returns RelayConfig if found, null otherwise
 */
export function parseLightningInvoiceMemo(invoice: string): RelayConfig | null {
    try {
        console.log("Parsing Lightning invoice memo for relay configuration...")

        // Decode the BOLT11 invoice using light-bolt11-decoder
        const decoded = decodeBolt11(invoice)

        if (!decoded.sections) {
            console.log("No sections found in decoded invoice")
            return null
        }

        // Find description section
        const descriptionSection = decoded.sections.find(
            (s) => s.name === "description"
        )

        if (!descriptionSection || !descriptionSection.value) {
            console.log("No description found in invoice")
            return null
        }

        const description = descriptionSection.value
        console.log("Found description:", description)

        // Try to parse the description as JSON
        try {
            const parsed = JSON.parse(description)
            if (parsed.relay && typeof parsed.relay === "string") {
                console.log("Found relay configuration in description:", parsed)
                return parsed as RelayConfig
            }
        } catch (e) {
            console.log("Description is not valid JSON, checking for URL patterns...")
        }

        // If not JSON, look for URL patterns in the description
        const urlPattern = /https?:\/\/[^\s"']+/g
        const urlMatches = description.match(urlPattern)

        if (urlMatches && urlMatches.length > 0) {
            // Check if any of these URLs look like relay endpoints
            for (const url of urlMatches) {
                if (
                    url.includes("/relay") ||
                    url.includes("/callback") ||
                    url.includes("/webhook")
                ) {
                    console.log("Found potential relay URL in description:", url)
                    return {
                        relay: url,
                        httpHeader: undefined,
                    }
                }
            }
        }

        console.log("No relay configuration found in invoice description")
        return null
    } catch (error) {
        console.error("Error parsing Lightning invoice memo:", error)
        return null
    }
}

/**
 * Parses a Lightning invoice and returns detailed information about it.
 * Uses light-bolt11-decoder to properly decode the BOLT11 invoice.
 *
 * @param invoice - The BOLT11 Lightning invoice string
 * @returns LightningInvoiceDetails with parsed information
 */
export function parseLightningInvoiceDetails(invoice: string): LightningInvoiceDetails {
    try {
        console.log("Parsing Lightning invoice details...")

        // Decode the BOLT11 invoice using light-bolt11-decoder
        const decoded = decodeBolt11(invoice)

        const lightningInvoiceDetails: LightningInvoiceDetails = {
            paymentHash: undefined,
            amount: undefined,
            amountMsat: undefined,
            description: undefined,
            descriptionHash: undefined,
            expiresAt: undefined,
            createdAt: undefined,
        }

        // Extract data from sections correctly
        if (decoded.sections) {
            // Find payment_hash section
            const paymentHashSection = decoded.sections.find(
                (s) => s.name === "payment_hash"
            )
            if (paymentHashSection?.value) {
                lightningInvoiceDetails.paymentHash = paymentHashSection.value
            }

            // Find amount section
            const amountSection = decoded.sections.find(
                (s) => s.name === "amount"
            )
            if (amountSection?.value) {
                lightningInvoiceDetails.amountMsat = Number(amountSection.value)
                lightningInvoiceDetails.amount = Math.floor(
                    Number(amountSection.value) / 1000
                )
            }

            // Find description section
            const descriptionSection = decoded.sections.find(
                (s) => s.name === "description"
            )
            if (descriptionSection) {
                lightningInvoiceDetails.description =
                    descriptionSection.value
            }

            // Find timestamp and expiry for date calculations
            const timestampSection = decoded.sections.find(
                (s) => s.name === "timestamp"
            )
            const expirySection = decoded.sections.find(
                (s) => s.name === "expiry"
            )

            if (timestampSection?.value) {
                lightningInvoiceDetails.createdAt = new Date(
                    Number(timestampSection.value) * 1000
                )

                if (expirySection?.value) {
                    const expiryTimestamp =
                        Number(timestampSection.value) + Number(expirySection.value)
                    lightningInvoiceDetails.expiresAt = new Date(
                        expiryTimestamp * 1000
                    )
                }
            }
        }

        console.log("Parsed invoice details:", lightningInvoiceDetails)
        return lightningInvoiceDetails
    } catch (error) {
        console.error("Error parsing Lightning invoice details:", error)
        return {}
    }
}

/**
 * Makes an HTTP POST request to the specified relay URL with optional custom headers and body.
 *
 * @param config - The relay configuration containing URL and optional headers
 * @param body - The request body to send (will be JSON stringified)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function makeRelayHttpCall(
    config: RelayConfig,
    body?: any
): Promise<boolean> {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "User-Agent": "Spark-RN-App/1.0.0",
        }

        // Add custom header if provided
        if (config.httpHeader) {
            headers[config.httpHeader.key] = String(config.httpHeader.value)
        }

        console.log("Making relay HTTP call to:", config.relay)
        console.log("With headers:", headers)
        console.log("With body:", body)

        const requestOptions: RequestInit = {
            method: "POST",
            headers,
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000), // 10 second timeout
        }

        // Add body if provided
        if (body !== undefined) {
            requestOptions.body = JSON.stringify(body)
        }

        const response = await fetch(config.relay, requestOptions)

        if (response.ok) {
            console.log("Relay HTTP call successful:", response.status)
            return true
        } else {
            console.warn(
                "Relay HTTP call failed:",
                response.status,
                response.statusText
            )
            return false
        }
    } catch (error) {
        console.error("Error making relay HTTP call:", error)
        return false
    }
}

/**
 * Processes a Lightning invoice payment by parsing the memo and making the relay call if configured.
 * This should be called after a Lightning payment attempt (successful or failed).
 *
 * @param invoice - The Lightning invoice that was paid (or attempted to be paid)
 * @param paymentSuccess - Whether the payment was successful or not
 * @returns Promise<boolean> - true if relay call was made successfully (or not needed), false if failed
 */
export async function processLightningPaymentRelay(
    invoice: string,
    paymentSuccess: boolean
): Promise<boolean> {
    try {
        const relayConfig = parseLightningInvoiceMemo(invoice)

        if (!relayConfig) {
            console.log("No relay configuration found in invoice memo")
            return true // Not an error, just no relay configured
        }

        console.log("Found relay configuration:", relayConfig)

        // Create body based on payment success
        const body = {
            invoice: paymentSuccess ? invoice : false,
        }

        console.log(
            "Sending relay call with payment status:",
            paymentSuccess ? "success" : "failed"
        )

        const success = await makeRelayHttpCall(relayConfig, body)

        if (success) {
            console.log("Relay call completed successfully")
        } else {
            console.warn("Relay call failed, but payment was successful")
        }

        return success
    } catch (error) {
        console.error("Error processing Lightning payment relay:", error)
        return false
    }
}
