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
            await sdk.initialize(undefined, "REGTEST")
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
    const openWallet = async (mnemonic: string) => {
        setLoading(true)
        setState("opening")
        setError(null)
        try {
            const sdk = SparkSDK.getInstance()
            await sdk.initialize(mnemonic, "REGTEST")
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
        const sdk = SparkSDK.getInstance()
        sdk.reset()
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
        /** Resets the hook state and SparkSDK */
        resetWalletState,
    }
}
