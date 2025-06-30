import { createLogger } from "@/logger"
import {
    ReactNativeSparkSigner,
    SparkWallet,
} from "@buildonspark/spark-sdk/native"

import {
    CreateLightningInvoiceParams,
    LightningReceiveRequest,
    TransferParams,
    PayLightningInvoiceParams,
    WalletTransfer,
    WalletLeaf,
    LightningSendRequest,
    LightningSendFeeEstimateInput,
} from "@/sparkTypes"

const logger = createLogger("SparkSDK")

export class SparkSDK {
    private static instance: SparkSDK | null = null
    private _wallet: SparkWallet | undefined
    private _mnemonic: string | undefined
    private _isInitialized: boolean = false

    private constructor() {}

    public static getInstance(): SparkSDK {
        if (!SparkSDK.instance) {
            SparkSDK.instance = new SparkSDK()
        }
        return SparkSDK.instance
    }

    get mnemonic(): string {
        return this._mnemonic ?? ""
    }

    get isInitialized(): boolean {
        return this._isInitialized
    }

    /**
     * Initializes the SparkWallet
     * @param mnemonics Optional mnemonic phrase
     * @param network The network to connect to
     */
    async initialize(
        mnemonics?: string,
        network: "MAINNET" | "REGTEST" | "TESTNET" | "SIGNET" = "REGTEST"
    ): Promise<void> {
        if (this._isInitialized) {
            logger.info("Wallet already initialized")
            return
        }

        const startTime = Date.now()

        try {
            logger.info(`Initializing wallet on ${network} network`)

            const { wallet, mnemonic } = await SparkWallet.initialize({
                mnemonicOrSeed: mnemonics,
                signer: new ReactNativeSparkSigner(),
                options: {
                    network: network,
                },
            })

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️  Wallet successfully initialized", {
                duration: `${duration}ms`,
                method: "initialize",
            })

            // Store wallet and mnemonic in class properties
            this._wallet = wallet
            this._mnemonic = mnemonic
            this._isInitialized = true

            if (mnemonic === undefined) {
                this._mnemonic = mnemonics
            }

            logger.info("Wallet successfully initialized")
        } catch (error) {
            logger.error("Error initializing wallet:", error)

            throw error
        }
    }

    /**
     * Resets the wallet instance and clears all stored data
     * This method should be called when logging out or when you need to clear the wallet state
     */
    public async reset(): Promise<void> {
        logger.info("Resetting wallet instance")

        const startTime = Date.now()

        try {
            // Check if wallet is available and cleanup connections
            if (this._wallet) {
                await this._wallet.cleanupConnections()
            }

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Cleanup connections completed", {
                duration: `${duration}ms`,
                method: "cleanupConnections",
            })
        } catch (e) {
            logger.error("Error cleaning up connections:", e)
        }

        // Reset instance variables
        this._wallet = undefined
        this._mnemonic = undefined
        this._isInitialized = false

        // Reset the singleton instance
        SparkSDK.instance = null

        logger.info("Wallet instance reset complete")
    }

    /**
     * Gets the current balance of the wallet.
     * You can use the forceRefetch option to synchronize your wallet and claim any
     * pending incoming lightning payment, spark transfer, or bitcoin deposit before returning the balance.
     *
     * @returns {Promise<BigInt>} The wallet's current balance in satoshis
     */
    async getBalance(): Promise<BigInt> {
        logger.info("Getting wallet balance...")

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const balanceResult = await this._wallet?.getBalance()

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️ Balance result: ", {
                balance: balanceResult?.balance.toString() ?? "0.00",
                duration: `${duration}ms`,
                method: "getBalance",
            })

            return balanceResult?.balance ?? BigInt(0)
        } catch (error) {
            logger.error("Error getting wallet balance:", error)

            throw error
        }
    }

    /**
     * Gets all transfers for the wallet.
     *
     * @param {number} [limit=20] - Maximum number of transfers to return
     * @param {number} [offset=0] - Offset for pagination
     * @returns {Promise<TransfersResponse>} Response containing the list of transfers
     */
    async getTransfers(
        limit = 20,
        offset = 0
    ): Promise<
        | {
              transfers: WalletTransfer[]
              offset: number
          }
        | undefined
    > {
        logger.info("Getting wallet transfers...")

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const transfersResult = await this._wallet?.getTransfers(
                limit,
                offset
            )

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️ Wallet transfers retrieved:", {
                transferCount: transfersResult.transfers?.length ?? 0,
                limit,
                offset,
                duration: `${duration}ms`,
                method: "getTransfers",
            })

            return transfersResult
        } catch (error) {
            logger.error("Error getting wallet transfers:", error)

            throw error
        }
    }

    /**
     * Gets the Spark address of the wallet.
     *
     * @returns {Promise<string>} The Spark address as a hex string.
     */
    async getSparkAddress(): Promise<string | undefined> {
        logger.info("Getting Spark address...")

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const address = await this._wallet?.getSparkAddress()

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️  Spark address retrieved:", {
                address,
                duration: `${duration}ms`,
                method: "getSparkAddress",
            })

            return address
        } catch (error) {
            logger.error("Error getting Spark address:", error)

            throw error
        }
    }

    /**
     * Generates a new deposit address for receiving bitcoin funds.
     * Note that this function returns a bitcoin address, not a spark address, and this address is single use.
     * Once you deposit funds to this address, it cannot be used again.
     * For Layer 1 Bitcoin deposits, Spark generates Pay to Taproot (P2TR) addresses.
     * These addresses start with "bc1p" and can be used to receive Bitcoin from any wallet.
     *
     * @returns {Promise<string>} A Bitcoin address for depositing funds
     */
    async getSingleUseDepositAddress(): Promise<string | undefined> {
        logger.info("Generating single-use deposit address...")

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const address = await this._wallet?.getSingleUseDepositAddress()

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️  Single-use deposit address generated:", {
                address,
                duration: `${duration}ms`,
                method: "getSingleUseDepositAddress",
            })

            return address
        } catch (error) {
            logger.error("Error generating single-use deposit address:", error)

            throw error
        }
    }

    /**
     * Gets all unused deposit addresses for the wallet.
     *
     * @returns {Promise<string[]>} The unused deposit addresses
     */
    async getUnusedDepositAddresses(): Promise<string[]> {
        logger.info("Getting unused deposit addresses...")

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const addresses = await this._wallet?.getUnusedDepositAddresses()

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️  Unused deposit addresses retrieved:", {
                addressCount: addresses?.length || 0,
                addresses,
                duration: `${duration}ms`,
                method: "getUnusedDepositAddresses",
            })

            return addresses ? addresses.map((address) => `${address}`) : []
        } catch (error) {
            logger.error("Error getting unused deposit addresses:", error)

            throw error
        }
    }

    /**
     * Sends a transfer to another Spark user.
     *
     * @param {TransferParams} params - Parameters for the transfer
     * @param {string} params.receiverSparkAddress - The recipient's Spark address
     * @param {number} params.amountSats - Amount to send in satoshis
     * @returns {Promise<WalletTransfer>} The completed transfer details
     */
    async transfer({
        amountSats,
        receiverSparkAddress,
    }: TransferParams): Promise<WalletTransfer> {
        logger.info("Sending transfer...", { amountSats, receiverSparkAddress })

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.transfer({
                amountSats: amountSats,
                receiverSparkAddress: receiverSparkAddress,
            })

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Transfer successful", {
                result,
                amountSats,
                receiverSparkAddress,
                duration: `${duration}ms`,
                method: "transfer",
            })

            return result
        } catch (error) {
            if (error instanceof Error) {
                const enhancedError = new Error(
                    `Transfer failed: ${error.message}`
                )
                enhancedError.stack = error.stack

                throw enhancedError
            }

            throw new Error("Unknown error occurred during transfer")
        }
    }

    /**
     * Claims a deposit to the wallet.
     * Note that if you used advancedDeposit, you don't need to call this function.
     * @param {string} txid - The transaction ID of the deposit
     * @returns {Promise<WalletLeaf[] | undefined>} The nodes resulting from the deposit
     */
    async claimDeposit(txid: string): Promise<WalletLeaf[]> {
        logger.info("Claiming deposit...", { txid })

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.claimDeposit(txid)

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Deposit claim result:", {
                result,
                txid,
                duration: `${duration}ms`,
                method: "claimDeposit",
            })

            return result
        } catch (error) {
            throw new Error("Unknown error occurred during deposit claim")
        }
    }

    /**
     * Creates a Lightning invoice for receiving payments.
     *
     * @param {CreateLightningInvoiceParams} params - Invoice parameters
     * @param {number} params.amountSats - Amount in satoshis
     * @param {string} [params.memo] - Description for the invoice
     * @param {number} [params.expirySeconds] - Optional expiry time in seconds
     * @param {boolean} [params.includeSparkAddress] - Include Spark address in fallback
     * @param {string} [params.receiverIdentityPubkey] - Receiver's identity public key
     * @param {string} [params.descriptionHash] - Hash of longer description
     * @returns {Promise<LightningReceiveRequest>} The created Lightning receive request
     */
    async createLightningInvoice({
        amountSats,
        memo,
        expirySeconds = 60 * 60 * 24, // Default to 24 hours
        includeSparkAddress = false,
        receiverIdentityPubkey,
        descriptionHash,
    }: CreateLightningInvoiceParams): Promise<LightningReceiveRequest> {
        logger.info("Creating Lightning invoice...", {
            amountSats,
            memo,
            expirySeconds,
            includeSparkAddress,
            receiverIdentityPubkey,
            descriptionHash,
        })

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.createLightningInvoice({
                amountSats: amountSats,
                memo: memo,
                expirySeconds: expirySeconds,
            })

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Lightning invoice created:", {
                invoiceId: result.id,
                amountSats,
                memo,
                expirySeconds,
                includeSparkAddress,
                duration: `${duration}ms`,
                method: "createLightningInvoice",
            })

            return result
        } catch (error) {
            logger.error("Error creating Lightning invoice:", error)

            throw error
        }
    }

    /**
     * Get a Lightning receive request by ID.
     *
     * @param {string} id - The ID of the Lightning receive request
     * @returns {Promise<LightningReceiveRequest | null>} The Lightning receive request
     */
    async getLightningReceiveRequest(
        id: string
    ): Promise<LightningReceiveRequest | null> {
        logger.info("Getting Lightning receive request...", { id })

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const lightningPaymentStatus =
                await this._wallet.getLightningReceiveRequest(id)

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Lightning receive request found:", {
                id,
                lightningPaymentStatus,
                duration: `${duration}ms`,
                method: "getLightningReceiveRequest",
            })

            return lightningPaymentStatus
        } catch (error) {
            logger.error("Error getting Lightning receive request:", error)

            throw error
        }
    }

    /**
     * Pays a Lightning invoice.
     *
     * @param {PayLightningInvoiceParams} params - Payment parameters
     * @param {string} params.invoice - The BOLT11-encoded Lightning invoice to pay
     * @param {number} params.maxFeeSats - Maximum fee willing to pay
     * @param {boolean} [params.preferSpark] - Prefer Spark transfer over Lightning
     * @returns {Promise<LightningSendRequest | WalletTransfer>} Payment result
     */
    async payLightningInvoice({
        invoice,
        maxFeeSats,
        preferSpark,
    }: PayLightningInvoiceParams): Promise<
        LightningSendRequest | WalletTransfer
    > {
        logger.info("Paying Lightning invoice...", {
            invoice,
            maxFeeSats,
            preferSpark,
        })

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.payLightningInvoice({
                invoice: invoice,
                maxFeeSats: maxFeeSats,
                // preferSpark: preferSpark,
            })

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Lightning invoice paid successfully:", {
                ...result,
                duration: `${duration}ms`,
                method: "payLightningInvoice",
            })

            return result
        } catch (error) {
            logger.error("Error paying Lightning invoice:", error)

            throw error
        }
    }

    /**
     * Gets fee estimate for sending Lightning payments.
     *
     * @param {LightningSendFeeEstimateInput} params - Fee estimation parameters
     * @param {string} params.encodedInvoice - The Lightning invoice to estimate fees for
     * @returns {Promise<number>} Fee estimate in satoshis
     */
    async getLightningSendFeeEstimate({
        encodedInvoice,
    }: LightningSendFeeEstimateInput): Promise<number> {
        logger.info("Getting Lightning send fee estimate...", {
            encodedInvoice,
        })

        const startTime = Date.now()

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const feeEstimate = await this._wallet.getLightningSendFeeEstimate({
                encodedInvoice: encodedInvoice,
            })

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Lightning send fee estimate retrieved:", {
                feeEstimate,
                duration: `${duration}ms`,
                method: "getLightningSendFeeEstimate",
            })

            return feeEstimate
        } catch (error) {
            logger.error("Error getting Lightning send fee estimate:", error)

            throw error
        }
    }
}
