import React from "react"
import { View, TextInput, Button, KeyboardAvoidingView, Platform } from "react-native"
import { styles } from "./styles"

type Props = {
    mnemonic: string
    onChangeMnemonic: (text: string) => void
    onPaste: () => void
    onOpen: () => void
}

export function OpenWalletForm({
    mnemonic,
    onChangeMnemonic,
    onPaste,
    onOpen,
}: Props) {
    const words = mnemonic.trim().split(/\s+/).filter(Boolean)
    const isValid = words.length === 12

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.formContainer}>
                <TextInput
                    placeholder="Enter your 12-word mnemonic"
                    value={mnemonic}
                    onChangeText={onChangeMnemonic}
                    style={styles.input}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />
                <Button title="Paste mnemonic" onPress={onPaste} />
            </View>
            <View style={styles.openButtonContainer}>
                <Button
                    title="Open wallet"
                    onPress={onOpen}
                    disabled={!isValid}
                />
            </View>
        </KeyboardAvoidingView>
    )
}
