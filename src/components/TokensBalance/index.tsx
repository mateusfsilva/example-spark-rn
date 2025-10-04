import React from "react"
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native"
import { TokenBalanceMap } from "@buildonspark/spark-sdk/native"
import { styles } from "./styles"

interface TokensBalanceProps {
    tokenBalance?: TokenBalanceMap | null
    loading?: boolean
    onReload?: () => void
}

export function TokensBalance({
    tokenBalance,
    loading,
    onReload,
}: TokensBalanceProps) {
    if (!tokenBalance || tokenBalance.size === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Token Balances</Text>
                    {onReload && (
                        <TouchableOpacity
                            style={styles.reloadButton}
                            onPress={onReload}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.reloadButtonText}>Reload</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.noTokensText}>No tokens available</Text>
            </View>
        )
    }

    const formatTokenBalance = (tokenData: any) => {
        const balance = tokenData.balance
        const decimals = tokenData.tokenMetadata.decimals || 0
        const divisor = BigInt(10 ** decimals)
        const formattedBalance = Number(balance) / Number(divisor)
        return formattedBalance.toFixed(2)
    }

    const tokenEntries = Array.from(tokenBalance.entries())

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Token Balances</Text>
                {onReload && (
                    <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={onReload}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.reloadButtonText}>Reload</Text>
                        )}
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
                {tokenEntries.map(([identifier, tokenData]) => (
                    <View key={identifier} style={styles.tokenItem}>
                        <View style={styles.tokenInfo}>
                            <Text
                                style={styles.tokenName}
                            >
                                {tokenData.tokenMetadata.tokenName ||
                                    identifier}
                            </Text>
                            <Text
                                style={styles.tokenTicker}
                            >
                                {tokenData.tokenMetadata.tokenTicker || ''}
                            </Text>
                        </View>
                        <Text style={styles.tokenBalance}>
                            {formatTokenBalance(tokenData)}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}
