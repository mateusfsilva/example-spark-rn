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
    invoice: string
    onCopied: () => void
}

export function LightningInvoiceLabel({ invoice, onCopied }: Props) {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(invoice)
        if (Platform.OS === "android") {
            ToastAndroid.show("Invoice copied!", ToastAndroid.SHORT)
        } else {
            Alert.alert("Copied", "Invoice copied to clipboard")
        }
        onCopied()
    }

    // Truncate invoice for display
    const displayInvoice =
        invoice.length > 50
            ? `${invoice.substring(0, 25)}...${invoice.substring(
                  invoice.length - 25
              )}`
            : invoice

    return (
        <TouchableOpacity onPress={handleCopy} style={styles.container}>
            <Text style={styles.invoice}>{displayInvoice}</Text>
            <Text style={styles.hint}>Tap to copy</Text>
        </TouchableOpacity>
    )
}
