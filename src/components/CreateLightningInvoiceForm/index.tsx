import React from "react"
import {
    View,
    TextInput,
    Button,
    ActivityIndicator,
    Text,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
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
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TextInput
                        placeholder="Enter amount in satoshis (e.g., 1000)"
                        placeholderTextColor="#666"
                        value={amountSats}
                        onChangeText={onChangeAmountSats}
                        style={styles.input}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                    />
                    <TextInput
                        placeholder="Add a description or note for this payment (optional)"
                        placeholderTextColor="#666"
                        value={memo}
                        onChangeText={onChangeMemo}
                        style={[styles.input, styles.memoInput]}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        autoCapitalize="sentences"
                        returnKeyType="done"
                        blurOnSubmit={true}
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
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}
