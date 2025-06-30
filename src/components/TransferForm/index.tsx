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
import { isValidSparkAddress } from "@/utils/sparkAddressValidation"
import { styles } from "./styles"

type Props = {
    receiverAddress: string
    amountSats: string
    onChangeReceiverAddress: (text: string) => void
    onChangeAmountSats: (text: string) => void
    onPasteAddress: () => void
    onTransfer: () => void
    onClose: () => void
    loading: boolean
    error?: string | null
}

export function TransferForm({
    receiverAddress,
    amountSats,
    onChangeReceiverAddress,
    onChangeAmountSats,
    onPasteAddress,
    onTransfer,
    onClose,
    loading,
    error,
}: Props) {
    const amount = parseInt(amountSats) || 0
    const isValidAddress = isValidSparkAddress(receiverAddress.trim())
    const canTransfer = amount > 0 && isValidAddress && !loading

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TextInput
                    placeholder="Receiver Spark address"
                    value={receiverAddress}
                    onChangeText={onChangeReceiverAddress}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                />
                <Button
                    title="Paste Address"
                    onPress={onPasteAddress}
                    disabled={loading}
                />
                <View style={styles.spacer} />
                <TextInput
                    placeholder="Amount in satoshis"
                    value={amountSats}
                    onChangeText={onChangeAmountSats}
                    style={styles.input}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <View style={styles.spacer} />
                <Button
                    title="Send Transfer"
                    onPress={onTransfer}
                    disabled={!canTransfer}
                />
                {loading && <ActivityIndicator style={styles.loading} />}
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {receiverAddress.trim() && !isValidAddress && (
                    <Text style={styles.error}>Invalid Spark address</Text>
                )}
                <View style={styles.spacer} />
                <Button title="Close" onPress={onClose} color="#888" />
            </View>
        </TouchableWithoutFeedback>
    )
}
