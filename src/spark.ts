import {
    WalletTransfer,
    WalletLeaf,
    // CreateLightningInvoiceParams,
    // LightningReceiveRequest,
} from "@buildonspark/spark-sdk/types"
import { createLogger } from "@/logger"
import {
    ReactNativeSparkSigner,
    SparkWallet,
} from "@buildonspark/spark-sdk/native"

import {
    CreateLightningInvoiceParams,
    LightningReceiveRequest,
    TransferParams,
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

        try {
            logger.info(`Initializing wallet on ${network} network`)

            const { wallet, mnemonic } = await SparkWallet.initialize({
                mnemonicOrSeed: mnemonics,
                signer: new ReactNativeSparkSigner(),
                options: {
                    network: network,
                },
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

        try {
            // Check if wallet is available and cleanup connections
            if (this._wallet) {
                await this._wallet.cleanupConnections()
            }
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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const balanceResult = await this._wallet?.getBalance()
            logger.info("Balance result: ", balanceResult)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const transfersResult = await this._wallet?.getTransfers(
                limit,
                offset
            )
            logger.info("Transfer result: ", transfersResult)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const address = await this._wallet?.getSparkAddress()
            logger.info("Spark address retrieved:", address)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const address = await this._wallet?.getSingleUseDepositAddress()
            logger.info("Single-use deposit address generated:", address)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const addresses = await this._wallet?.getUnusedDepositAddresses()
            logger.info("Unused deposit addresses retrieved:", addresses)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.transfer({
                amountSats: amountSats,
                receiverSparkAddress: receiverSparkAddress,
            })

            logger.info("Transfer successful, raw result:", result)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.claimDeposit(txid)

            logger.info("Deposit claim result:", { txid, result })

            return result
        } catch (error) {
            throw new Error("Unknown error occurred during deposit claim")
        }
    }

    /**
     * Creates a Lightning invoice for receiving payments.
     *
     * @param {Object} params - Parameters for the lightning invoice
     * @param {number} params.amountSats - Amount in satoshis
     * @param {string} params.memo - Description for the invoice
     * @param {number} [params.expirySeconds] - Optional expiry time in seconds
     * @returns {Promise<LightningReceiveRequest>} BOLT11 encoded invoice
     */
    async createLightningInvoice({
        amountSats,
        memo,
        expirySeconds = 60 * 60 * 24, // Default to 24 hours
    }: CreateLightningInvoiceParams): Promise<LightningReceiveRequest> {
        logger.info("Creating Lightning invoice...", {
            amountSats,
            memo,
            expirySeconds,
        })

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

            logger.info("Lightning invoice created successfully:", result)

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

        try {
            // Check if wallet is available
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const lightningPaymentStatus =
                await this._wallet.getLightningReceiveRequest(id)

            logger.info("Lightning receive request found:", {
                id,
                lightningPaymentStatus,
            })

            return lightningPaymentStatus
        } catch (error) {
            logger.error("Error getting Lightning receive request:", error)

            throw error
        }
    }
}
