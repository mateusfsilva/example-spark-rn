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
    txid: string
    onChangeTxid: (text: string) => void
    onPaste: () => void
    onClaim: () => void
    onClose: () => void
    loading: boolean
    error?: string | null
}

export function ClaimDepositForm({
    txid,
    onChangeTxid,
    onPaste,
    onClaim,
    onClose,
    loading,
    error,
}: Props) {
    return (
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TextInput
                        placeholder="Enter transaction id"
                        value={txid}
                        onChangeText={onChangeTxid}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        blurOnSubmit={true}
                    />
                    <Button
                        title="Paste txid"
                        onPress={onPaste}
                        disabled={loading}
                    />
                    <View style={styles.spacer} />
                    <Button
                        title="Claim deposit"
                        onPress={onClaim}
                        disabled={loading || !txid.trim()}
                    />
                    {loading && <ActivityIndicator style={styles.loading} />}
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <Button title="Close" onPress={onClose} color="#888" />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}
