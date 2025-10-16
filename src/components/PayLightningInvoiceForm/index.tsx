import React, { useEffect } from "react"
import {
    View,
    TextInput,
    Button,
    ActivityIndicator,
    Text,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native"
import { styles } from "@/components/PayLightningInvoiceForm/styles"
import { isValidLightningInvoice } from "@/utils/lightningInvoiceParser"

type Props = {
    invoice: string
    feeEstimate: number | null
    onChangeInvoice: (text: string) => void
    onPasteInvoice: () => void
    onEstimateFee: () => void
    onPayInvoice: () => void
    onClose: () => void
    loading: boolean
    estimatingFee: boolean
    error?: string | null
}

export function PayLightningInvoiceForm({
    invoice,
    feeEstimate,
    onChangeInvoice,
    onPasteInvoice,
    onEstimateFee,
    onPayInvoice,
    onClose,
    loading,
    estimatingFee,
    error,
}: Props) {
    const hasInvoice = invoice.trim().length > 0
    const hasFeeEstimate = feeEstimate !== null
    const canPay = hasInvoice && hasFeeEstimate && !loading && !estimatingFee

    // Auto-estimate fee when a valid Lightning invoice is entered
    useEffect(() => {
        const trimmedInvoice = invoice.trim()

        if (trimmedInvoice.length > 0 &&
            isValidLightningInvoice(trimmedInvoice) &&
            !hasFeeEstimate &&
            !estimatingFee) {

            console.log("Auto-estimating fee for valid Lightning invoice")
            onEstimateFee()
        }
    }, [invoice, hasFeeEstimate, estimatingFee, onEstimateFee])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TextInput
                    placeholder="Lightning invoice (BOLT11)"
                    value={invoice}
                    onChangeText={onChangeInvoice}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                />

                <Button title="Paste Invoice" onPress={onPasteInvoice} />

                {hasInvoice && !hasFeeEstimate && !estimatingFee && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Estimate Fee"
                            onPress={onEstimateFee}
                        />
                    </View>
                )}

                {estimatingFee && (
                    <View style={styles.buttonContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.estimatingText}>Estimating fee...</Text>
                    </View>
                )}

                {hasFeeEstimate && (
                    <Text style={styles.feeEstimate}>
                        Estimated fee: {feeEstimate} sats
                    </Text>
                )}

                {error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.actionButtons}>
                    {canPay && (
                        <View style={styles.buttonContainer}>
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#007AFF"
                                />
                            ) : (
                                <Button
                                    title="Pay Invoice"
                                    onPress={onPayInvoice}
                                />
                            )}
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Cancel"
                            onPress={onClose}
                            color="#FF3B30"
                        />
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}
