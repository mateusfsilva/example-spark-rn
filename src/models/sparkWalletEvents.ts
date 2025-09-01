// Typed Spark wallet events (mirrors SDK)
export interface SparkWalletEvents {
    /** Emitted when an incoming transfer is successfully claimed. Includes the transfer ID and new total balance. */
    "transfer:claimed": (transferId: string, updatedBalance: number) => void

    /** Emitted when a deposit is marked as available. Includes the deposit ID and new total balance. */
    "deposit:confirmed": (depositId: string, updatedBalance: number) => void

    /** Emitted when the stream is connected */
    "stream:connected": () => void

    /** Emitted when the stream disconnects and fails to reconnect after max attempts */
    "stream:disconnected": (reason: string) => void

    /** Emitted when attempting to reconnect the stream */
    "stream:reconnecting": (
        attempt: number,
        maxAttempts: number,
        delayMs: number,
        error: string
    ) => void
}

// Normalized (stringified) variants for easier consumption/logging
export interface SparkWalletNormalizedEvents {
    "transfer:claimed": (transferId: string, updatedBalanceSats: string) => void

    "deposit:confirmed": (depositId: string, updatedBalanceSats: string) => void

    "stream:connected": () => void

    "stream:disconnected": (reason: string) => void

    "stream:reconnecting": (
        attempt: number,
        maxAttempts: number,
        delayMs: number,
        error: string
    ) => void
}
