import React, { useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native"
import { QueryTokenTransactionsResponse } from "@/sparkTypes"
import { styles } from "@/components/TokenTransactions/styles"
import { createLogger } from "@/logger"

const logger = createLogger("TokenTransactions")

interface TokenTransactionsProps {
    transactions?: QueryTokenTransactionsResponse | null
    loading?: boolean
    error?: string | null
    onReload?: () => void
    onClose?: () => void
}

export function TokenTransactions({
    transactions,
    loading,
    error,
    onReload,
    onClose,
}: TokenTransactionsProps) {
    const formatDate = (timestamp: string | number) => {
        try {
            const date = new Date(timestamp)
            return date.toLocaleDateString() + " " + date.toLocaleTimeString()
        } catch {
            return "Unknown date"
        }
    }

    /**
     * Converts a Uint8Array (uint128) to BigInt
     * @param bytes Uint8Array (up to 16 bytes)
     * @param littleEndian default false -> assume big endian
     */
    function uint128FromBytes(bytes: Uint8Array, littleEndian = false): bigint {
        if (bytes.length > 16) {
            throw new Error("Uint128 must have at most 16 bytes")
        }

        let result = 0n
        if (littleEndian) {
            for (let i = 0; i < bytes.length; i++) {
                result |= BigInt(bytes[i]) << BigInt(8 * i)
            }
        } else {
            for (let i = 0; i < bytes.length; i++) {
                result = (result << 8n) | BigInt(bytes[i])
            }
        }
        return result
    }

    /**
     * Decodes token amount and returns useful formats
     * @param bytes Uint8Array representing uint128
     * @param decimals number of decimal places of the token (e.g.: 6)
     * @param opts.optional { littleEndian?: boolean, autoDetect?: boolean }
     * @returns { raw: bigint, formatted: string, asNumber?: number }
     */
    function decodeTokenAmount(
        bytes: Uint8Array,
        decimals: number,
        opts?: { littleEndian?: boolean; autoDetect?: boolean }
    ): { raw: bigint; formatted: string; asNumber?: number } {
        const littleEndian = !!opts?.littleEndian
        // If autoDetect is enabled, calculates both and chooses the one that makes more sense
        let raw: bigint
        if (opts?.autoDetect) {
            const vLE = uint128FromBytes(bytes, true)
            const vBE = uint128FromBytes(bytes, false)
            // Heuristic: choose the one that, when divided by 10^decimals, becomes smaller, since real
            // token values are normally not gigantic. Adjust if needed.
            raw = vLE <= vBE ? vLE : vBE
        } else {
            raw = uint128FromBytes(bytes, littleEndian)
        }

        const divisor = 10n ** BigInt(decimals)
        const integerPart = raw / divisor
        let fractional = raw % divisor

        // Formats fractional part with leading zeros
        let fractionalStr = fractional.toString().padStart(decimals, "0")

        // Remove unnecessary trailing zeros
        fractionalStr = fractionalStr.replace(/0+$/, "")

        const formatted =
            fractionalStr.length > 0
                ? `${integerPart.toString()}.${fractionalStr}`
                : integerPart.toString()

        // Returns number only if it's safe
        let asNumber: number | undefined = undefined
        const maxSafe = BigInt(Number.MAX_SAFE_INTEGER)
        if (raw <= maxSafe) {
            asNumber = Number(raw) / Number(divisor)
        }

        return {
            raw,
            formatted,
            asNumber,
        }
    }

    const formatTokenIdentifier = (tokenIdentifier: Uint8Array) => {
        // Convert Uint8Array to hex string
        return (
            "0x" +
            Array.from(tokenIdentifier)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
        )
    }

    const getStatusText = (status: number) => {
        switch (status) {
            case 0:
                return "Started"
            case 1:
                return "Signed"
            case 2:
                return "Finalized"
            case 3:
                return "Started Cancelled"
            case 4:
                return "Signed Cancelled"
            case 5:
                return "Revealed"
            case 10:
                return "Unknown"
            default:
                return "Unknown"
        }
    }

    const getStatusColor = (status: number) => {
        switch (status) {
            case 2: // FINALIZED
                return "#4CAF50" // Green
            case 1: // SIGNED
            case 5: // REVEALED
                return "#FF9800" // Orange
            case 3: // STARTED_CANCELLED
            case 4: // SIGNED_CANCELLED
                return "#F44336" // Red
            case 0: // STARTED
                return "#2196F3" // Blue
            default:
                return "#666" // Gray
        }
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Token Transactions</Text>
                    {onClose && (
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    {onReload && (
                        <TouchableOpacity
                            style={styles.reloadButton}
                            onPress={onReload}
                            disabled={loading}
                        >
                            <Text style={styles.reloadButtonText}>
                                {loading ? "Retrying..." : "Retry"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    if (
        !transactions ||
        transactions.tokenTransactionsWithStatus.length === 0
    ) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Token Transactions</Text>
                    {onClose && (
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No token transactions found
                    </Text>
                    {onReload && (
                        <TouchableOpacity
                            style={styles.reloadButton}
                            onPress={onReload}
                            disabled={loading}
                        >
                            <Text style={styles.reloadButtonText}>
                                {loading ? "Loading..." : "Refresh"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Token Transactions (
                    {transactions.tokenTransactionsWithStatus.length})
                </Text>
                {onClose && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    onReload ? (
                        <RefreshControl
                            refreshing={loading || false}
                            onRefresh={onReload}
                        />
                    ) : undefined
                }
            >
                {transactions.tokenTransactionsWithStatus.map(
                    (txWithStatus, index) => {
                        const tx = txWithStatus.tokenTransaction
                        const status = txWithStatus.status
                        const statusText = getStatusText(status)
                        const statusColor = getStatusColor(status)

                        // Get the first token output for display
                        const firstOutput = tx?.tokenOutputs?.[0]

                        return (
                            <View key={index} style={styles.transactionItem}>
                                <View style={styles.transactionHeader}>
                                    <Text style={styles.detailLabel}>
                                        {formatDate(tx.clientCreatedTimestamp)}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: statusColor },
                                        ]}
                                    >
                                        <Text style={styles.statusText}>
                                            {statusText}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.transactionDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Type:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {tx?.tokenInputs?.$case ===
                                            "transferInput"
                                                ? "Transfer"
                                                : tx?.tokenInputs?.$case ===
                                                  "mintInput"
                                                ? "Mint"
                                                : tx?.tokenInputs?.$case ===
                                                  "createInput"
                                                ? "Create"
                                                : "Unknown"}
                                        </Text>
                                    </View>
                                    {firstOutput?.tokenIdentifier && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>
                                                Token ID:
                                            </Text>
                                            <Text
                                                style={styles.detailValue}
                                                numberOfLines={1}
                                            >
                                                {formatTokenIdentifier(
                                                    firstOutput.tokenIdentifier
                                                ).substring(0, 20)}
                                                ...
                                            </Text>
                                        </View>
                                    )}
                                    {firstOutput?.tokenAmount && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>
                                                Amount:
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.detailValue,
                                                    {
                                                        color: "#007AFF",
                                                        fontWeight: "700",
                                                    },
                                                ]}
                                            >
                                                {
                                                    decodeTokenAmount(
                                                        firstOutput.tokenAmount,
                                                        6,
                                                        { littleEndian: false }
                                                    ).formatted
                                                }
                                            </Text>
                                        </View>
                                    )}
                                    {firstOutput?.id && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>
                                                Output ID:
                                            </Text>
                                            <Text
                                                style={styles.detailValue}
                                                numberOfLines={1}
                                            >
                                                {firstOutput.id.substring(
                                                    0,
                                                    20
                                                )}
                                                ...
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )
                    }
                )}
            </ScrollView>
        </View>
    )
}
