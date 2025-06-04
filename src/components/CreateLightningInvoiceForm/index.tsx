import React from "react"
import { View, TextInput, Button, ActivityIndicator, Text } from "react-native"
import { styles } from "./styles"

type Props = {
    amountSats: string
    memo: string
    onChangeAmountSats: (text: string) => void
    onChangeMemo: (text: string) => void
    onGenerate: () => void
    onClose: () => void
    loading: boolean
    error?: string | null
}

export function CreateLightningInvoiceForm({
    amountSats,
    memo,
    onChangeAmountSats,
    onChangeMemo,
    onGenerate,
    onClose,
    loading,
    error,
}: Props) {
    const amount = parseInt(amountSats) || 0

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Amount in satoshis"
                value={amountSats}
                onChangeText={onChangeAmountSats}
                style={styles.input}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                placeholder="Note (optional)"
                value={memo}
                onChangeText={onChangeMemo}
                style={[styles.input, styles.memoInput]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="sentences"
            />
            <Button
                title="Generate Invoice"
                onPress={onGenerate}
                disabled={loading || amount <= 0}
            />
            {loading && <ActivityIndicator style={styles.loading} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.spacer} />
            <Button title="Close" onPress={onClose} color="#888" />
        </View>
    )
}
