import { useState, useEffect } from "react"
import { SparkSDK } from "@/spark"
import { processLightningPaymentRelay } from "@/utils/lightningInvoiceParser"
import { saveMnemonic as saveMnemonicToStorage, getSavedMnemonic, clearSavedMnemonic, hasSavedMnemonic } from "@/utils/mnemonicStorage"
import {
    WalletBalance,
    TransferTokensParams,
    QueryTokenTransactionsParams,
    QueryTokenTransactionsResponse,
} from "@/sparkTypes"
import { createLogger } from "@/logger"

type WalletState = "idle" | "creating" | "opening" | "ready" | "error"

/**
 * Hook to manage the Bitcoin wallet using SparkSDK.
 * Provides methods to create, open, fetch balance and reset the wallet.
 */
export function useWallet() {
    /**
     * Current wallet balance in satoshis (null if not loaded)
     */
    const [balance, setBalance] = useState<number | null>(null)
    /**
     * Complete wallet balance including token balances (null if not loaded)
     */
    const [walletStats, setWalletStats] = useState<WalletBalance | null>(null)
    /**
     * Indicates if any operation is in progress
     */
    const [loading, setLoading] = useState(false)
    /**
     * Current wallet state: idle, creating, opening, ready or error
     */
    const [state, setState] = useState<WalletState>("idle")
    /**
     * Error message, if any
     */
    const [error, setError] = useState<string | null>(null)
    /**
     * Spark address for the current wallet (null if not loaded)
     */
    const [sparkAddress, setSparkAddress] = useState<string | null>(null)
    /**
     * Indicates if the Spark address should be shown
     */
    const [showSparkAddress, setShowSparkAddress] = useState(false)
    /**
     * Indicates if the user wants to save the mnemonic securely
     */
    const [saveMnemonic, setSaveMnemonic] = useState(false)
    /**
     * Indicates if there's a saved mnemonic available
     */
    const [hasSavedMnemonicState, setHasSavedMnemonicState] = useState(false)
    /**
     * Bitcoin address for the current wallet (null if not loaded)
     */
    const [bitcoinAddress, setBitcoinAddress] = useState<string | null>(null)
    /**
     * Indicates if the Bitcoin address should be shown
     */
    const [showBitcoinAddress, setShowBitcoinAddress] = useState(false)
    /**
     * Indicates if any claim operation is in progress
     */
    const [claimLoading, setClaimLoading] = useState(false)
    /**
     * Error message for claim operation, if any
     */
    const [claimError, setClaimError] = useState<string | null>(null)
    /**
     * Lightning invoice string (null if not created)
     */
    const [lightningInvoice, setLightningInvoice] = useState<string | null>(
        null
    )
    /**
     * Indicates if the Lightning invoice should be shown
     */
    const [showLightningInvoice, setShowLightningInvoice] = useState(false)
    /**
     * Indicates if any Lightning invoice creation is in progress
     */
    const [lightningLoading, setLightningLoading] = useState(false)
    /**
     * Error message for Lightning invoice creation, if any
     */
    const [lightningError, setLightningError] = useState<string | null>(null)
    /**
     * Indicates if the mnemonic should be shown
     */
    const [showMnemonic, setShowMnemonic] = useState(false)
    /**
     * Indicates if any transfer operation is in progress
     */
    const [transferLoading, setTransferLoading] = useState(false)
    /**
     * Error message for transfer operation, if any
     */
    const [transferError, setTransferError] = useState<string | null>(null)
    /**
     * Indicates if any Lightning invoice payment is in progress
     */
    const [payInvoiceLoading, setPayInvoiceLoading] = useState(false)
    /**
     * Error message for Lightning invoice payment, if any
     */
    const [payInvoiceError, setPayInvoiceError] = useState<string | null>(null)
    /**
     * Lightning fee estimate in satoshis (null if not calculated)
     */
    const [lightningFeeEstimate, setLightningFeeEstimate] = useState<
        number | null
    >(null)
    /**
     * Indicates if fee estimation is in progress
     */
    const [estimatingFee, setEstimatingFee] = useState(false)
    /**
     * Spark sats invoice address (null if not created)
     */
    const [sparkSatsAddress, setSparkSatsAddress] = useState<string | null>(
        null
    )
    /**
     * Indicates if the Spark sats address should be shown
     */
    const [showSparkSatsAddress, setShowSparkSatsAddress] = useState(false)
    /**
     * Indicates if any Spark sats invoice creation is in progress
     */
    const [sparkSatsLoading, setSparkSatsLoading] = useState(false)
    /**
     * Error message for Spark sats invoice creation, if any
     */
    const [sparkSatsError, setSparkSatsError] = useState<string | null>(null)

    // Fulfill Spark invoice state
    const [fulfillSparkLoading, setFulfillSparkLoading] = useState(false)
    const [fulfillSparkError, setFulfillSparkError] = useState<string | null>(
        null
    )
    const [fulfillSparkResult, setFulfillSparkResult] = useState<string | null>(
        null
    )

    // Token transfer state
    const [transferTokensLoading, setTransferTokensLoading] = useState(false)
    const [transferTokensError, setTransferTokensError] = useState<
        string | null
    >(null)
    const [transferTokensResult, setTransferTokensResult] = useState<
        string | null
    >(null)

    // Token transactions query state
    const [queryTokenTransactionsLoading, setQueryTokenTransactionsLoading] =
        useState(false)
    const [queryTokenTransactionsError, setQueryTokenTransactionsError] =
        useState<string | null>(null)
    const [queryTokenTransactionsResult, setQueryTokenTransactionsResult] =
        useState<QueryTokenTransactionsResponse | null>(null)

    // Token L1 address state
    const [tokenL1Address, setTokenL1Address] = useState<string | null>(null)
    const [tokenL1AddressLoading, setTokenL1AddressLoading] = useState(false)
    const [tokenL1AddressError, setTokenL1AddressError] = useState<
        string | null
    >(null)

    const logger = createLogger("useWallet")

    /**
     * Check for saved mnemonic on hook initialization
     */
    useEffect(() => {
        const checkSavedMnemonic = async () => {
            const hasSaved = await hasSavedMnemonic()
            setHasSavedMnemonicState(hasSaved)

            if (hasSaved) {
                const savedMnemonic = await getSavedMnemonic()
                if (savedMnemonic) {
                    // Auto-open wallet with saved mnemonic
                    await openWallet(savedMnemonic)
                }
            }
        }

        checkSavedMnemonic()
    }, [])

    /**
     * Creates a new Bitcoin wallet (without mnemonic).
     * Updates the balance and the hook state.
     * @returns {Promise<void>}
     */
    const createNewWallet = async () => {
        setLoading(true)
        setState("creating")
        setError(null)

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.initialize(undefined, "MAINNET")

            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)

            setState("ready")
        } catch (e: any) {
            setError(e?.message || "Failed to create wallet")
            setState("error")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Opens an existing wallet using the provided mnemonic.
     * Updates the balance and the hook state.
     * @param mnemonic - Wallet mnemonic phrase
     * @returns {Promise<void>}
     */
    const openWallet = async (mnemonicPhrase: string) => {
        setLoading(true)
        setState("opening")
        setError(null)

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.initialize(mnemonicPhrase, "MAINNET")

            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)

            setState("ready")

            // Save mnemonic if user requested it
            if (saveMnemonic) {
                await saveMnemonicToStorage(mnemonicPhrase)
                setHasSavedMnemonicState(true)
            }
        } catch (e: any) {
            setError(e?.message || "Failed to open wallet")
            setState("error")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Fetches the current wallet balance.
     * Updates the balance value.
     * @returns {Promise<void>}
     */
    const fetchBalance = async () => {
        setLoading(true)

        try {
            const sdk = SparkSDK.getInstance()

            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)
        } catch (e: any) {
            setError(e?.message || "Failed to fetch balance")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Gets the Spark address for the current wallet.
     * Updates the sparkAddress and showSparkAddress state.
     * @returns {Promise<void>}
     */
    const getSparkAddress = async () => {
        setLoading(true)

        try {
            const sdk = SparkSDK.getInstance()
            const address = await sdk.getSparkAddress()

            setSparkAddress(address ?? "")
            setShowSparkAddress(true)
        } catch (e: any) {
            setError(e?.message || "Failed to get Spark address")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Hides the Spark address and shows the button again.
     */
    const hideSparkAddress = () => {
        setShowSparkAddress(false)
        setSparkAddress(null)
    }

    /**
     * Gets a Bitcoin deposit address for the wallet.
     * If there are unused addresses, shows the first one.
     * Otherwise, generates a new one.
     * @returns {Promise<void>}
     */
    const getBitcoinAddress = async () => {
        setLoading(true)

        try {
            const sdk = SparkSDK.getInstance()
            const unused = await sdk.getUnusedDepositAddresses()

            if (unused && unused.length > 0) {
                setBitcoinAddress(unused[0])
            } else {
                const newAddress = await sdk.getSingleUseDepositAddress()
                setBitcoinAddress(newAddress ?? "")
            }

            setShowBitcoinAddress(true)
        } catch (e: any) {
            setError(e?.message || "Failed to get Bitcoin address")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Hides the Bitcoin address and shows the button again.
     */
    const hideBitcoinAddress = () => {
        setShowBitcoinAddress(false)
        setBitcoinAddress(null)
    }

    /**
     * Claims a Bitcoin deposit using the provided transaction id.
     * Updates the balance if successful.
     * @param txid - The transaction id of the deposit
     * @returns {Promise<void>}
     */
    const claimDeposit = async (txid: string) => {
        setClaimLoading(true)
        setClaimError(null)

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.claimDeposit(txid)

            // Refresh balance after claim
            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)
        } catch (e: any) {
            setClaimError(e?.message || "Failed to claim deposit")
        } finally {
            setClaimLoading(false)
        }
    }

    /**
     * Creates a Lightning invoice for receiving payments.
     * @param amountSats - Amount in satoshis
     * @param memo - Description for the invoice
     * @returns {Promise<void>}
     */
    const createLightningInvoice = async (amountSats: number, memo: string) => {
        setLightningLoading(true)
        setLightningError(null)

        try {
            const sdk = SparkSDK.getInstance()
            const result = await sdk.createLightningInvoice({
                amountSats,
                memo,
            })

            // Assuming the result contains the invoice string
            setLightningInvoice(result.invoice.encodedInvoice)
            setShowLightningInvoice(true)
        } catch (e: any) {
            setLightningError(
                e?.message || "Failed to create Lightning invoice"
            )
        } finally {
            setLightningLoading(false)
        }
    }

    /**
     * Hides the Lightning invoice and shows the button again.
     */
    const hideLightningInvoice = () => {
        setShowLightningInvoice(false)
        setLightningInvoice(null)
    }

    /**
     * Shows the wallet mnemonic.
     */
    const showWalletMnemonic = () => {
        console.log("showWalletMnemonic called")
        setShowMnemonic(true)
    }

    /**
     * Hides the wallet mnemonic.
     */
    const hideWalletMnemonic = () => {
        setShowMnemonic(false)
    }

    /**
     * Gets the current wallet mnemonic from SparkSDK.
     */
    const getMnemonic = (): string => {
        const sdk = SparkSDK.getInstance()
        const mnemonic = sdk.mnemonic

        return mnemonic
    }

    /**
     * Transfers funds to another Spark address.
     * @param receiverSparkAddress - The recipient's Spark address
     * @param amountSats - Amount to send in satoshis
     * @returns {Promise<void>}
     */
    const transfer = async (
        receiverSparkAddress: string,
        amountSats: number
    ): Promise<void> => {
        setTransferLoading(true)
        setTransferError(null)

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.transfer({
                receiverSparkAddress,
                amountSats,
            })

            // Refresh balance after transfer
            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)
        } catch (e: any) {
            const errorMessage = e?.message || "Failed to send transfer"
            setTransferError(errorMessage)
            // Re-throw the error so the caller knows it failed
            throw new Error(errorMessage)
        } finally {
            setTransferLoading(false)
        }
    }

    /**
     * Estimates the fee for paying a Lightning invoice.
     * @param invoice - The Lightning invoice to estimate fee for
     * @returns {Promise<void>}
     */
    const estimateLightningFee = async (invoice: string): Promise<void> => {
        setEstimatingFee(true)
        setPayInvoiceError(null)
        setLightningFeeEstimate(null)

        try {
            const sdk = SparkSDK.getInstance()
            const feeEstimate = await sdk.getLightningSendFeeEstimate({
                encodedInvoice: invoice,
            })
            setLightningFeeEstimate(feeEstimate)
        } catch (e: any) {
            const errorMessage = e?.message || "Failed to estimate fee"
            setPayInvoiceError(errorMessage)
        } finally {
            setEstimatingFee(false)
        }
    }

    /**
     * Pays a Lightning invoice.
     * @param invoice - The Lightning invoice to pay
     * @param maxFeeSats - Maximum fee willing to pay in satoshis
     * @returns {Promise<void>}
     */
    const payLightningInvoice = async (
        invoice: string,
        maxFeeSats: number
    ): Promise<void> => {
        setPayInvoiceLoading(true)
        setPayInvoiceError(null)

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.payLightningInvoice({
                invoice,
                maxFeeSats,
                preferSpark: false,
            })

            // Refresh balance after payment
            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)

            // Reset fee estimate after successful payment
            setLightningFeeEstimate(null)

            // Process relay call if configured in invoice memo (payment was successful)
            try {
                await processLightningPaymentRelay(invoice, true)
            } catch (relayError) {
                // Don't fail the payment if relay call fails, just log it
                console.warn('Relay call failed after successful payment:', relayError)
            }
        } catch (e: any) {
            const errorMessage = e?.message || "Failed to pay Lightning invoice"
            setPayInvoiceError(errorMessage)

            // Process relay call if configured in invoice memo (payment failed)
            try {
                await processLightningPaymentRelay(invoice, false)
            } catch (relayError) {
                // Don't fail the payment if relay call fails, just log it
                console.warn('Relay call failed after payment error:', relayError)
            }

            // Re-throw the error so the caller knows it failed
            throw new Error(errorMessage)
        } finally {
            setPayInvoiceLoading(false)
        }
    }

    /**
     * Clears the Lightning fee estimate.
     * Useful when closing the pay invoice form or starting fresh.
     */
    const clearLightningFeeEstimate = () => {
        setLightningFeeEstimate(null)
        setPayInvoiceError(null)
    }

    /**
     * Resets the hook state and SparkSDK, clearing all wallet data.
     * @returns {Promise<void>}
     */
    const resetWalletState = async () => {
        setBalance(null)
        setLoading(false)
        setState("idle")
        setError(null)
        setSparkAddress(null)
        setShowSparkAddress(false)
        setBitcoinAddress(null)
        setShowBitcoinAddress(false)
        setLightningInvoice(null)
        setShowLightningInvoice(false)
        setLightningLoading(false)
        setLightningError(null)
        setShowMnemonic(false)
        setTransferLoading(false)
        setTransferError(null)
        setPayInvoiceLoading(false)
        setPayInvoiceError(null)
        setLightningFeeEstimate(null)
        setEstimatingFee(false)
        setSparkSatsAddress(null)
        setShowSparkSatsAddress(false)
        setSparkSatsLoading(false)
        setSparkSatsError(null)
        setFulfillSparkLoading(false)
        setFulfillSparkError(null)
        setFulfillSparkResult(null)

        // Clear saved mnemonic on logout
        await clearSavedMnemonic()
        setHasSavedMnemonicState(false)
        setSaveMnemonic(false)

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.reset()
        } catch (e) {
            // Ignore reset errors, just log them
            logger.error("Error resetting SDK:", e)
        }
    }

    /**
     * Creates a Spark sats invoice (Spark address) for receiving payments.
     * Falls back with a friendly error if not supported by the SDK version.
     */
    const createSparkSatsInvoice = async (
        amountSats: number,
        memo?: string
    ): Promise<void> => {
        setSparkSatsLoading(true)
        setSparkSatsError(null)
        try {
            const sdk = SparkSDK.getInstance()
            const address = await sdk.createSatsInvoice({
                amount: amountSats,
                memo,
            })
            setSparkSatsAddress(address)
            setShowSparkSatsAddress(true)
        } catch (e: any) {
            const msg =
                e?.name === "NotImplementedError"
                    ? "Spark sats invoices are not supported by this SDK version. Please use Fulfill Spark Invoice for testing."
                    : e?.message || "Failed to create Spark sats invoice"
            setSparkSatsError(msg)
        } finally {
            setSparkSatsLoading(false)
        }
    }

    /**
     * Fulfill a Spark invoice (payer flow).
     * For zero-amount invoices, provide amountSats.
     */
    const fulfillSparkInvoice = async (
        invoice: string,
        amountSats?: number
    ): Promise<void> => {
        setFulfillSparkLoading(true)
        setFulfillSparkError(null)
        setFulfillSparkResult(null)

        try {
            const sdk = SparkSDK.getInstance()
            const result = await sdk.fulfillSparkInvoice([
                { invoice: invoice.trim(), amountSats },
            ])
            setFulfillSparkResult(result)

            // Refresh balance after fulfilling
            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)
        } catch (e: any) {
            setFulfillSparkError(
                e?.message || "Failed to fulfill Spark invoice"
            )
            // Re-throw so caller can keep the form open without closing
            throw new Error(e?.message || "Failed to fulfill Spark invoice")
        } finally {
            setFulfillSparkLoading(false)
        }
    }

    const hideSparkSatsAddress = () => {
        setShowSparkSatsAddress(false)
        setSparkSatsAddress(null)
    }

    /**
     * Transfers tokens to another Spark address.
     * Updates loading state and stores the transaction ID.
     * @param params Transfer parameters including token identifier, amount, and receiver address
     * @returns {Promise<void>}
     */
    const transferTokens = async (
        params: TransferTokensParams
    ): Promise<void> => {
        setTransferTokensLoading(true)
        setTransferTokensError(null)
        setTransferTokensResult(null)

        try {
            const sdk = SparkSDK.getInstance()
            const txId = await sdk.transferTokens(params)

            setTransferTokensResult(txId)

            // Refresh balance after transfer
            const walletBalance = await sdk.getBalance()

            setBalance(Number(walletBalance.balance))
            setWalletStats(walletBalance)
        } catch (e: any) {
            setTransferTokensError(e?.message || "Failed to transfer tokens")
        } finally {
            setTransferTokensLoading(false)
        }
    }

    /**
     * Queries token transaction history with optional filters.
     * Updates loading state and stores the query results.
     * @param params Query parameters for filtering token transactions
     * @returns {Promise<void>}
     */
    const queryTokenTransactions = async (
        params: QueryTokenTransactionsParams
    ): Promise<void> => {
        setQueryTokenTransactionsLoading(true)
        setQueryTokenTransactionsError(null)
        setQueryTokenTransactionsResult(null)

        try {
            const sdk = SparkSDK.getInstance()
            const result = await sdk.queryTokenTransactions(params)

            setQueryTokenTransactionsResult(result)
        } catch (e: any) {
            setQueryTokenTransactionsError(
                e?.message || "Failed to query token transactions"
            )
        } finally {
            setQueryTokenTransactionsLoading(false)
        }
    }

    /**
     * Gets the L1 address for token operations.
     * Updates loading state and stores the address.
     * @returns {Promise<void>}
     */
    const getTokenL1Address = async (): Promise<void> => {
        setTokenL1AddressLoading(true)
        setTokenL1AddressError(null)

        try {
            const sdk = SparkSDK.getInstance()
            const address = await sdk.getTokenL1Address()

            setTokenL1Address(address)
        } catch (e: any) {
            setTokenL1AddressError(
                e?.message || "Failed to get token L1 address"
            )
        } finally {
            setTokenL1AddressLoading(false)
        }
    }

    /**
     * Gets the identity public key of the wallet.
     * @returns {Promise<string>} The identity public key as hex string
     */
    const getIdentityPublicKey = async (): Promise<string> => {
        const sdk = SparkSDK.getInstance()
        return await sdk.getIdentityPublicKey()
    }

    return {
        /** Current wallet balance in satoshis (null if not loaded) */
        balance,
        /** Complete wallet stats including token balances (null if not loaded) */
        walletStats,
        /** Indicates if any operation is in progress */
        loading,
        /** Current wallet state: idle, creating, opening, ready or error */
        state,
        /** Error message, if any */
        error,
        /** Spark address for the current wallet (null if not loaded) */
        sparkAddress,
        /** Indicates if the Spark address should be shown */
        showSparkAddress,
        /** Bitcoin address for the current wallet (null if not loaded) */
        bitcoinAddress,
        /** Indicates if the Bitcoin address should be shown */
        showBitcoinAddress,
        /** Indicates if the user wants to save the mnemonic securely */
        saveMnemonic,
        /** Function to update the save mnemonic preference */
        setSaveMnemonic,
        /** Indicates if there's a saved mnemonic available */
        hasSavedMnemonicState,
        /** Creates a new Bitcoin wallet (without mnemonic) */
        createNewWallet,
        /** Opens an existing wallet using the provided mnemonic */
        openWallet,
        /** Fetches the current wallet balance */
        fetchBalance,
        /** Gets the Spark address for the current wallet */
        getSparkAddress,
        /** Hides the Spark address and shows the button again */
        hideSparkAddress,
        /** Gets a Bitcoin deposit address for the wallet */
        getBitcoinAddress,
        /** Hides the Bitcoin address and shows the button again */
        hideBitcoinAddress,
        /** Claims a Bitcoin deposit using the provided transaction id */
        claimDeposit,
        /** Indicates if any claim operation is in progress */
        claimLoading,
        /** Error message for claim operation, if any */
        claimError,
        /** Lightning invoice string (null if not created) */
        lightningInvoice,
        /** Indicates if the Lightning invoice should be shown */
        showLightningInvoice,
        /** Creates a Lightning invoice for receiving payments */
        createLightningInvoice,
        /** Hides the Lightning invoice and shows the button again */
        hideLightningInvoice,
        /** Indicates if any Lightning invoice creation is in progress */
        lightningLoading,
        /** Error message for Lightning invoice creation, if any */
        lightningError,
        /** Indicates if the mnemonic should be shown */
        showMnemonic,
        /** Shows the wallet mnemonic */
        showWalletMnemonic,
        /** Hides the wallet mnemonic */
        hideWalletMnemonic,
        /** Gets the current wallet mnemonic from SparkSDK */
        getMnemonic,
        /** Transfers funds to another Spark address */
        transfer,
        /** Indicates if any transfer operation is in progress */
        transferLoading,
        /** Error message for transfer operation, if any */
        transferError,
        /** Resets the hook state and SparkSDK */
        resetWalletState,
        /** Indicates if any Lightning invoice payment is in progress */
        payInvoiceLoading,
        /** Error message for Lightning invoice payment, if any */
        payInvoiceError,
        /** Lightning fee estimate in satoshis (null if not calculated) */
        lightningFeeEstimate,
        /** Indicates if fee estimation is in progress */
        estimatingFee,
        /** Estimates the fee for paying a Lightning invoice */
        estimateLightningFee,
        /** Pays a Lightning invoice */
        payLightningInvoice,
        /** Clears the Lightning fee estimate */
        clearLightningFeeEstimate,
        /** Spark sats invoice address (null if not created) */
        sparkSatsAddress,
        /** Indicates if the Spark sats address should be shown */
        showSparkSatsAddress,
        /** Creates a Spark sats invoice (Spark address) for receiving payments */
        createSparkSatsInvoice,
        /** Hides the Spark sats address and shows the button again */
        hideSparkSatsAddress,
        /** Indicates if any Spark sats invoice creation is in progress */
        sparkSatsLoading,
        /** Error message for Spark sats invoice creation, if any */
        sparkSatsError,

        // Fulfill Spark invoice
        fulfillSparkInvoice,
        fulfillSparkLoading,
        fulfillSparkError,
        fulfillSparkResult,

        // Token transfer methods
        /** Transfers tokens to another Spark address */
        transferTokens,
        /** Indicates if token transfer is in progress */
        transferTokensLoading,
        /** Error message for token transfer, if any */
        transferTokensError,
        /** Transaction ID of successful token transfer */
        transferTokensResult,

        // Token transactions query methods
        /** Queries token transaction history with optional filters */
        queryTokenTransactions,
        /** Indicates if token transactions query is in progress */
        queryTokenTransactionsLoading,
        /** Error message for token transactions query, if any */
        queryTokenTransactionsError,
        /** Query results for token transactions */
        queryTokenTransactionsResult,

        // Token L1 address methods
        /** Gets the L1 address for token operations */
        getTokenL1Address,
        /** Token L1 address (null if not retrieved) */
        tokenL1Address,
        /** Indicates if getting token L1 address is in progress */
        tokenL1AddressLoading,
        /** Error message for getting token L1 address, if any */
        tokenL1AddressError,

        // Identity public key method
        /** Gets the identity public key of the wallet */
        getIdentityPublicKey,
    }
}
