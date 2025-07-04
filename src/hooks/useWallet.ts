import { useState } from "react"
import { SparkSDK } from "@/spark"
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

    const logger = createLogger("useWallet")

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

            const balance = await sdk.getBalance()
            setBalance(Number(balance))

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

            const balance = await sdk.getBalance()
            setBalance(Number(balance))

            setState("ready")
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
            const balance = await sdk.getBalance()

            setBalance(Number(balance))
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
            const balance = await sdk.getBalance()
            setBalance(Number(balance))
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
            const balance = await sdk.getBalance()
            setBalance(Number(balance))
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
            const balance = await sdk.getBalance()
            setBalance(Number(balance))

            // Reset fee estimate after successful payment
            setLightningFeeEstimate(null)
        } catch (e: any) {
            const errorMessage = e?.message || "Failed to pay Lightning invoice"
            setPayInvoiceError(errorMessage)
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

        try {
            const sdk = SparkSDK.getInstance()
            await sdk.reset()
        } catch (e) {
            // Ignore reset errors, just log them
            logger.error("Error resetting SDK:", e)
        }
    }

    return {
        /** Current wallet balance in satoshis (null if not loaded) */
        balance,
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
    }
}
