import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    Dimensions,
} from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { MaterialIcons } from "@expo/vector-icons"
import { isValidSparkAddress } from "@/utils/sparkAddressValidation"
import { styles } from "./styles"

const { width, height } = Dimensions.get("window")

interface QRCodeScannerProps {
    onScan: (data: string, type: QRCodeType) => void
    onClose: () => void
}

export type QRCodeType = "lightning_invoice" | "spark_address" | "bitcoin_address" | "unknown"

interface QRCodeScannerState {
    hasPermission: boolean | null
    scanned: boolean
}

export function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
    const [permission, requestPermission] = useCameraPermissions()
    const [state, setState] = useState<QRCodeScannerState>({
        hasPermission: null,
        scanned: false,
    })

    useEffect(() => {
        if (permission?.granted) {
            setState(prev => ({ ...prev, hasPermission: true }))
        } else if (permission?.canAskAgain === false) {
            setState(prev => ({ ...prev, hasPermission: false }))
        }
    }, [permission])

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (state.scanned) return

        setState(prev => ({ ...prev, scanned: true }))

        const qrType = identifyQRCodeType(data)

        // Reset scanned state after a delay to allow for re-scanning
        setTimeout(() => {
            setState(prev => ({ ...prev, scanned: false }))
        }, 2000)

        onScan(data, qrType)
    }

    const identifyQRCodeType = (data: string): QRCodeType => {
        // Lightning invoice (starts with "lnbc" or "lntb" or "lnbcrt")
        if (data.toLowerCase().startsWith("lnbc") ||
            data.toLowerCase().startsWith("lntb") ||
            data.toLowerCase().startsWith("lnbcrt")) {
            return "lightning_invoice"
        }

        // Spark address (starts with "sp" or "sprt")
        if (isValidSparkAddress(data)) {
            return "spark_address"
        }

        // Bitcoin address (starts with "1", "3", "bc1", "tb1", "bcrt1")
        if (data.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/) || // Legacy addresses
            data.match(/^bc1[a-z0-9]{39,59}$/) || // Bech32 mainnet
            data.match(/^tb1[a-z0-9]{39,59}$/) || // Bech32 testnet
            data.match(/^bcrt1[a-z0-9]{39,59}$/)) { // Bech32 regtest
            return "bitcoin_address"
        }

        return "unknown"
    }

    const requestCameraPermission = async () => {
        const result = await requestPermission()
        setState(prev => ({ ...prev, hasPermission: result.granted }))
    }

    if (state.hasPermission === null) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        Camera permission request
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestCameraPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            Grant Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    if (state.hasPermission === false) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        Camera access denied
                    </Text>
                    <Text style={styles.permissionSubText}>
                        To scan QR codes, you need to allow camera access in device settings.
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={state.scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <MaterialIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Scan QR Code</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <View style={styles.scanArea}>
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.instructionText}>
                            Position the QR code within the frame to scan it
                        </Text>
                        {state.scanned && (
                            <Text style={styles.scannedText}>
                                QR Code scanned!
                            </Text>
                        )}
                    </View>
                </View>
            </CameraView>
        </View>
    )
}
