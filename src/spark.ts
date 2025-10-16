import { SparkEventManager } from "@/events/SparkEventManager"
import { createLogger } from "@/logger"
import {
    SparkWalletEvents,
    SparkWalletNormalizedEvents,
} from "@/models/sparkWalletEvents"
import {
    LightningReceiveRequest,
    LightningSendFeeEstimateInput,
    LightningSendRequest,
    QueryTokenTransactionsParams,
    QueryTokenTransactionsResponse,
    TransferTokensParams,
    WalletBalance,
    WalletLeaf,
    WalletTransfer,
} from "@/sparkTypes"
import {
    CreateLightningInvoiceParams,
    PayLightningInvoiceParams,
    ReactNativeSparkSigner,
    SparkWallet,
    TransferParams,
} from "@buildonspark/spark-sdk/native"

const logger = createLogger("SparkSDK")

export class SparkSDK {
    private static instance: SparkSDK | null = null
    private _wallet: SparkWallet | undefined
    private _mnemonic: string | undefined
    private _isInitialized: boolean = false

    // Event manager extracted from this class
    private readonly events = new SparkEventManager()

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
        network: "MAINNET" | "REGTEST" | "TESTNET" | "SIGNET" = "MAINNET"
    ): Promise<void> {
        if (this._isInitialized) {
            logger.info("Wallet already initialized")

            return
        }

        const startTime = Date.now()

        try {
            logger.info(`Initializing wallet on ${network} network`)

            const { mnemonic, wallet } = await SparkWallet.initialize({
                mnemonicOrSeed: mnemonics,
                signer: new ReactNativeSparkSigner(),
                options: {
                    network: network,
                    optimizationOptions: {
                        auto: false,
                        multiplicity: 5,
                    },
                    tokenOptimizationOptions: {
                        enabled: true,
                        intervalMs: 300000,
                        minOutputsThreshold: 50,
                    },
                },
            })

            const duration = Date.now() - startTime

            logger.info("✨ ⏱️  Wallet successfully initialized", {
                duration: `${duration}ms`,
                method: "initialize",
            })

            this._wallet = wallet
            this._mnemonic = mnemonic
            this._isInitialized = true

            if (mnemonic === undefined) {
                this._mnemonic = mnemonics
            }

            // Bind events to the new wallet
            this.events.bindWallet(wallet)

            const names = this.events.getRegisteredEventNames()

            console.log("Registered event names:", names)
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
            if (this._wallet) {
                // Unbind events before cleanup
                this.events.unbindWallet()

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

        this._wallet = undefined
        this._mnemonic = undefined
        this._isInitialized = false

        SparkSDK.instance = null

        logger.info("Wallet instance reset complete")
    }

    /**
     * Gets the current balance of the wallet including token balances.
     * You can use the forceRefetch option to synchronize your wallet and claim any
     * pending incoming lightning payment, spark transfer, or bitcoin deposit before returning the balance.
     *
     * @returns {Promise<WalletBalance>} The wallet's current balance in satoshis and token balances
     */
    async getBalance(): Promise<WalletBalance> {
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
                balance: balanceResult?.balance?.toString(),
                tokenBalancesCount: balanceResult?.tokenBalances?.size || 0,
                tokenBalances: balanceResult?.tokenBalances
                    ? Array.from(balanceResult.tokenBalances.entries()).map(
                          ([identifier, tokenData]) => ({
                              identifier,
                              balance: tokenData.balance.toString(),
                              tokenName: tokenData.tokenMetadata.tokenName,
                              tokenTicker: tokenData.tokenMetadata.tokenTicker,
                              decimals: tokenData.tokenMetadata.decimals,
                              maxSupply:
                                  tokenData.tokenMetadata.maxSupply.toString(),
                          })
                      )
                    : [],
                duration: `${duration}ms`,
                method: "getBalance",
            })

            return {
                balance: balanceResult?.balance ?? BigInt(0),
                tokenBalances: balanceResult?.tokenBalances ?? new Map(),
            }
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

    /**
     * Creates a Spark invoice (Spark address) for a sats payment on Spark.
     *
     * @param params.amount Amount in sats to receive
     * @param params.memo Optional memo
     * @param params.senderPublicKey Optional expected sender pubkey (hex)
     * @param params.expiryTime Optional expiry time
     * @returns The Spark address (bech32m)
     */
    async createSatsInvoice({
        amount,
        memo,
        senderPublicKey,
        expiryTime,
    }: {
        amount: number
        memo?: string
        senderPublicKey?: string
        expiryTime?: Date
    }): Promise<string> {
        logger.info("Creating Spark sats invoice...", {
            amount,
            memo,
            expiryTime,
        })

        const startTime = Date.now()

        try {
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const address = await this._wallet.createSatsInvoice({
                amount,
                memo,
                senderPublicKey,
                expiryTime,
            })

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️  Spark sats invoice created:", {
                address,
                duration: `${duration}ms`,
                method: "createSatsInvoice",
            })

            return `${address}`
        } catch (error) {
            logger.error("Error creating Spark sats invoice:", error)

            if (error instanceof Error) {
                throw new Error(
                    `Create Spark sats invoice failed: ${error.message}`
                )
            }

            throw error
        }
    }

    /**
     * Fulfill one or more Spark invoices.
     * For zero-amount invoices, pass amountSats to specify the amount.
     * Returns an ID string (transfer/payment id).
     */
    async fulfillSparkInvoice(
        invoices: { invoice: string; amountSats?: number }[]
    ): Promise<string> {
        logger.info("Fulfilling Spark invoice(s)...", {
            count: invoices.length,
        })

        const startTime = Date.now()

        try {
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            // Map to SDK shape: { invoice: SparkAddressFormat, amount?: bigint }
            const sparkInvoices = invoices.map(({ invoice, amountSats }) => ({
                invoice: invoice as unknown as string,
                amount:
                    typeof amountSats === "number"
                        ? BigInt(amountSats)
                        : undefined,
            }))

            const result = await this._wallet.fulfillSparkInvoice(sparkInvoices)

            const duration = Date.now() - startTime
            logger.info("✨ ⏱️  Spark invoice(s) fulfilled:", {
                result,
                duration: `${duration}ms`,
                method: "fulfillSparkInvoice",
            })

            return result
        } catch (error) {
            logger.error("Error fulfilling Spark invoice(s):", error)

            throw error
        }
    }

    /**
     * Transfers tokens to another Spark address
     *
     * @param params Transfer parameters including token identifier, amount, and receiver address
     * @returns Promise resolving to the transaction ID of the token transfer
     */
    async transferTokens(params: TransferTokensParams): Promise<string> {
        logger.info("Transferring tokens...", {
            tokenIdentifier: params.tokenIdentifier,
            tokenAmount: params.tokenAmount.toString(),
            receiverSparkAddress: params.receiverSparkAddress,
            outputSelectionStrategy: params.outputSelectionStrategy,
        })

        const startTime = Date.now()

        try {
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const txId = await this._wallet.transferTokens({
                tokenIdentifier: params.tokenIdentifier,
                tokenAmount: params.tokenAmount,
                receiverSparkAddress: params.receiverSparkAddress,
                outputSelectionStrategy: params.outputSelectionStrategy,
                selectedOutputs: params.selectedOutputs,
            })

            const duration = Date.now() - startTime
            logger.info("✨ Token transfer completed", {
                txId,
                duration: `${duration}ms`,
                method: "transferTokens",
            })

            return txId
        } catch (error) {
            logger.error("Error transferring tokens:", error)
            throw error
        }
    }

    /**
     * Queries token transaction history with optional filters
     *
     * @param params Query parameters for filtering token transactions
     * @returns Promise resolving to token transactions with their current status
     */
    async queryTokenTransactions(
        params: QueryTokenTransactionsParams
    ): Promise<QueryTokenTransactionsResponse> {
        logger.info("Querying token transactions...", {
            ownerPublicKeys: params.ownerPublicKeys?.length || 0,
            issuerPublicKeys: params.issuerPublicKeys?.length || 0,
            tokenTransactionHashes: params.tokenTransactionHashes?.length || 0,
            tokenIdentifiers: params.tokenIdentifiers?.length || 0,
            outputIds: params.outputIds?.length || 0,
            pageSize: params.pageSize,
            offset: params.offset,
        })

        const startTime = Date.now()

        try {
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const result = await this._wallet.queryTokenTransactions({
                ownerPublicKeys: params.ownerPublicKeys,
                issuerPublicKeys: params.issuerPublicKeys,
                tokenTransactionHashes: params.tokenTransactionHashes,
                tokenIdentifiers: params.tokenIdentifiers,
                outputIds: params.outputIds,
                pageSize: params.pageSize,
                offset: params.offset,
            })

            const duration = Date.now() - startTime
            logger.info("✨ Token transactions queried", {
                transactionCount: result.tokenTransactionsWithStatus.length,
                offset: result.offset,
                duration: `${duration}ms`,
                method: "queryTokenTransactions",
            })

            return result
        } catch (error) {
            logger.error("Error querying token transactions:", error)
            throw error
        }
    }

    /**
     * Gets the L1 address for token operations
     *
     * @returns Promise resolving to the L1 address string
     */
    async getTokenL1Address(): Promise<string> {
        logger.info("Getting token L1 address...")

        const startTime = Date.now()

        try {
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const address = await this._wallet.getTokenL1Address()

            const duration = Date.now() - startTime
            logger.info("✨ Token L1 address retrieved", {
                address,
                duration: `${duration}ms`,
                method: "getTokenL1Address",
            })

            return address
        } catch (error) {
            logger.error("Error getting token L1 address:", error)
            throw error
        }
    }

    /**
     * Gets the identity public key of the wallet
     *
     * @returns Promise resolving to the identity public key as hex string
     */
    async getIdentityPublicKey(): Promise<string> {
        logger.info("Getting identity public key...")

        const startTime = Date.now()

        try {
            if (!this._wallet) {
                throw new Error("Wallet is not initialized")
            }

            const publicKey = await this._wallet.getIdentityPublicKey()

            const duration = Date.now() - startTime
            logger.info("✨ Identity public key retrieved", {
                duration: `${duration}ms`,
                method: "getIdentityPublicKey",
            })

            return publicKey
        } catch (error) {
            logger.error("Error getting identity public key:", error)
            throw error
        }
    }

    /**
     * Typed event subscriptions (delegated to SparkEventManager)
     */
    public on<E extends keyof SparkWalletEvents>(
        event: E,
        listener: SparkWalletEvents[E]
    ): void {
        this.events.on(event, listener)
    }

    public off<E extends keyof SparkWalletEvents>(
        event: E,
        listener: SparkWalletEvents[E]
    ): void {
        this.events.off(event, listener)
    }

    public once<E extends keyof SparkWalletEvents>(
        event: E,
        listener: SparkWalletEvents[E]
    ): void {
        this.events.once(event, listener)
    }

    public onWalletEvent(
        eventName: string,
        listener: (...args: any[]) => void
    ): void {
        this.events.onAny(eventName, listener)
    }

    public onNormalized<E extends keyof SparkWalletNormalizedEvents>(
        event: E,
        listener: SparkWalletNormalizedEvents[E]
    ): void {
        this.events.onNormalized(event, listener)
    }

    public offNormalized<E extends keyof SparkWalletNormalizedEvents>(
        event: E,
        listener: SparkWalletNormalizedEvents[E]
    ): void {
        this.events.offNormalized(event, listener)
    }

    public enableEventDebugging(): void {
        this.events.enableEventDebugging()
    }

    public disableEventDebugging(): void {
        this.events.disableEventDebugging()
    }

    public getRegisteredEventNames(): Array<string | symbol> {
        return this.events.getRegisteredEventNames()
    }
}
