import React from "react"
import {
    View,
    TouchableOpacity,
    Text,
    Platform,
    ToastAndroid,
    Alert,
} from "react-native"
import * as Clipboard from "expo-clipboard"
import { styles } from "./styles"

type Props = {
    mnemonic: string
    onCopied: () => void
}

export function WalletMnemonicLabel({ mnemonic, onCopied }: Props) {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(mnemonic)
        if (Platform.OS === "android") {
            ToastAndroid.show("Mnemonic copied!", ToastAndroid.SHORT)
        } else {
            Alert.alert("Copied", "Mnemonic copied to clipboard")
        }
        onCopied()
    }

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <Text style={styles.title}>Wallet Mnemonic</Text>
                <TouchableOpacity
                    onPress={handleCopy}
                    style={styles.mnemonicContainer}
                >
                    <Text style={styles.mnemonic}>{mnemonic}</Text>
                    <Text style={styles.hint}>Tap to copy</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
