// Add imports for Spark address validation
import { bech32m } from "bech32"

// Types for Spark address validation
type NetworkType = "MAINNET" | "TESTNET" | "REGTEST" | "SIGNET" | "LOCAL"
type SparkAddressFormat = string

// Network prefixes for Spark addresses
const AddressNetwork: Record<NetworkType, string> = {
    MAINNET: "sp",
    // TESTNET: "spt",
    REGTEST: "sprt",
    // SIGNET: "sps",
    // LOCAL: "spl",
} as const

// Custom error class for validation
class ValidationError extends Error {
    public field?: string
    public value?: string
    public expected?: string
    public cause?: Error

    constructor(
        message: string,
        details?: { field?: string; value?: string; expected?: string },
        cause?: Error
    ) {
        super(message)
        this.name = "ValidationError"
        this.field = details?.field
        this.value = details?.value
        this.expected = details?.expected
        this.cause = cause
    }
}

// Mock SparkAddress decoder (replace with actual implementation)
const SparkAddress = {
    decode: (words: number[]) => {
        // This should be replaced with the actual SparkAddress.decode implementation
        // For now, return a mock structure
        return {
            identityPublicKey: new Uint8Array(33), // 33 bytes for a compressed public key
        }
    },
}

// Helper functions
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
}

function isValidPublicKey(publicKey: string): boolean {
    // Basic validation: should be 66 characters (33 bytes in hex)
    const hexRegex = /^[0-9a-fA-F]{66}$/
    return hexRegex.test(publicKey)
}

// Decode Spark address for a specific network
function decodeSparkAddress(address: string, network: NetworkType): string {
    try {
        const decoded = bech32m.decode(address as SparkAddressFormat, 200)
        if (decoded.prefix !== AddressNetwork[network]) {
            throw new ValidationError("Invalid Spark address prefix", {
                field: "address",
                value: address,
                expected: `prefix='${AddressNetwork[network]}'`,
            })
        }

        const payload = SparkAddress.decode(bech32m.fromWords(decoded.words))
        const publicKey = bytesToHex(payload.identityPublicKey)

        if (!isValidPublicKey(publicKey)) {
            throw new ValidationError("Invalid public key in Spark address", {
                field: "address",
                value: address,
            })
        }

        return publicKey
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error
        }
        throw new ValidationError(
            "Failed to decode Spark address",
            {
                field: "address",
                value: address,
            },
            error as Error
        )
    }
}

export function isValidSparkAddress(address: string): boolean {
    if (!address || typeof address !== "string") {
        return false
    }

    // List of networks to try in order of preference
    const networksToTry: NetworkType[] = [
        "REGTEST",
        "MAINNET",
        // "TESTNET",
        // "SIGNET",
        // "LOCAL",
    ]

    // Try to decode the address with each network type
    for (const network of networksToTry) {
        try {
            // Check if the address starts with the expected prefix for this network
            if (address.startsWith(AddressNetwork[network])) {
                // Try to decode the address for this network
                decodeSparkAddress(address, network)
                return true // If successful, the address is valid
            }
        } catch (error) {
            // Continue to next network if decoding fails
            continue
        }
    }

    // If none of the networks worked, the address is invalid
    return false
}
