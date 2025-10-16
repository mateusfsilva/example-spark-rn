import React from "react"
import {
    View,
    TextInput,
    Button,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Text,
} from "react-native"
import Checkbox from "expo-checkbox"
import { styles } from "./styles"

type Props = {
    mnemonic: string
    onChangeMnemonic: (text: string) => void
    onPaste: () => void
    onOpen: () => void
    saveMnemonic: boolean
    onChangeSaveMnemonic: (value: boolean) => void
}

export function OpenWalletForm({
    mnemonic,
    onChangeMnemonic,
    onPaste,
    onOpen,
    saveMnemonic,
    onChangeSaveMnemonic,
}: Props) {
    // Improved mnemonic validation
    const cleanMnemonic = mnemonic.trim().replace(/\s+/g, ' ')
    const words = cleanMnemonic.split(' ').filter(word => word.length > 0)
    const isValid = words.length === 12

    // Debug logging
    console.log('Mnemonic validation:', {
        original: mnemonic,
        cleaned: cleanMnemonic,
        words: words,
        wordCount: words.length,
        isValid: isValid
    })

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            value={saveMnemonic}
                            onValueChange={onChangeSaveMnemonic}
                            style={styles.checkbox}
                        />
                        <Text style={styles.checkboxLabel}>
                            Save mnemonic securely on this device
                        </Text>
                    </View>

                    {/* Validation status */}
                    <Text style={[styles.validationText, isValid ? styles.validationSuccess : styles.validationError]}>
                        {words.length === 0
                            ? "Enter your 12-word mnemonic"
                            : words.length < 12
                                ? `${words.length}/12 words`
                                : isValid
                                    ? "✓ Valid mnemonic"
                                    : "Invalid mnemonic"}
                    </Text>
                </View>
                <View style={styles.openButtonContainer}>
                    <Button
                        title="Open wallet"
                        onPress={onOpen}
                        disabled={!isValid}
                    />
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}
