import React from "react"
import {
    TouchableOpacity,
    Text,
    Platform,
    ToastAndroid,
    Alert,
} from "react-native"
import * as Clipboard from "expo-clipboard"
import { styles } from "./styles"

type Props = {
    address: string
    onCopied: () => void
}

export function BitcoinAddressLabel({ address, onCopied }: Props) {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(address)
        if (Platform.OS === "android") {
            ToastAndroid.show("Address copied!", ToastAndroid.SHORT)
        } else {
            Alert.alert("Copied", "Address copied to clipboard")
        }
        onCopied()
    }

    return (
        <TouchableOpacity onPress={handleCopy}>
            <Text style={styles.address}>{address}</Text>
            <Text style={styles.hint}>Tap to copy</Text>
        </TouchableOpacity>
    )
}
