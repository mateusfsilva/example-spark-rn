import React from "react"
import {
    View,
    TextInput,
    Button,
    ActivityIndicator,
    Text,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native"
import { styles } from "./styles"

type Props = {
    invoice: string
    amountSats: string
    onChangeInvoice: (text: string) => void
    onChangeAmountSats: (text: string) => void
    onFulfill: () => void
    onClose: () => void
    loading: boolean
    error?: string | null
    result?: string | null
}

export function FulfillSparkInvoiceForm({
    invoice,
    amountSats,
    onChangeInvoice,
    onChangeAmountSats,
    onFulfill,
    onClose,
    loading,
    error,
    result,
}: Props) {
    const hasInvoice = invoice.trim().length > 0
    const amount = parseInt(amountSats) || 0

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TextInput
                    placeholder="Spark address (invoice)"
                    value={invoice}
                    onChangeText={onChangeInvoice}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                />
                <Text style={styles.hint}>
                    For zero-amount invoices, set an amount in sats (optional).
                </Text>
                <TextInput
                    placeholder="Amount in satoshis (optional)"
                    value={amountSats}
                    onChangeText={onChangeAmountSats}
                    style={styles.input}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <View style={styles.buttonRow}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <Button
                            title="Fulfill Spark Invoice"
                            onPress={onFulfill}
                            disabled={!hasInvoice}
                        />
                    )}
                    <Button title="Cancel" onPress={onClose} color="#FF3B30" />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {result ? (
                    <Text style={styles.result}>
                        Fulfilled. Result: {result}
                    </Text>
                ) : null}
            </View>
        </TouchableWithoutFeedback>
    )
}
