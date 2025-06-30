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
                        placeholder="Amount in satoshis"
                        value={amountSats}
                        onChangeText={onChangeAmountSats}
                        style={styles.input}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
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
