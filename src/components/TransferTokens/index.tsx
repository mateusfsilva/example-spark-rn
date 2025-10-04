import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Modal,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import { TokenBalanceMap, Bech32mTokenIdentifier } from "@buildonspark/spark-sdk/native"
import { isValidSparkAddress } from "@buildonspark/spark-sdk/native"
import { styles } from "@/components/TransferTokens/styles"

interface TransferTokensProps {
    tokenBalances?: TokenBalanceMap | null
    loading?: boolean
    onTransfer?: (params: {
        tokenIdentifier: Bech32mTokenIdentifier
        tokenAmount: bigint
        receiverSparkAddress: string
    }) => Promise<void>
    onClose?: () => void
}

export function TransferTokens({
    tokenBalances,
    loading,
    onTransfer,
    onClose,
}: TransferTokensProps) {
    const [selectedTokenId, setSelectedTokenId] = useState<string>("")
    const [amount, setAmount] = useState("")
    const [destinationAddress, setDestinationAddress] = useState("")
    const [isValidAddress, setIsValidAddress] = useState(false)
    const [transferLoading, setTransferLoading] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Get available tokens
    const availableTokens = tokenBalances ? Array.from(tokenBalances.entries()) : []

    // Get selected token balance
    const selectedTokenBalance = selectedTokenId ? tokenBalances?.get(selectedTokenId as Bech32mTokenIdentifier) : null

    // Validate address when it changes
    useEffect(() => {
        if (destinationAddress.trim()) {
            setIsValidAddress(isValidSparkAddress(destinationAddress.trim()))
        } else {
            setIsValidAddress(false)
        }
    }, [destinationAddress])

    const handlePasteAddress = async () => {
        try {
            const text = await Clipboard.getStringAsync()
            if (text) {
                setDestinationAddress(text.trim())
            }
        } catch (error) {
            Alert.alert("Error", "Failed to paste address")
        }
    }

    const formatTokenBalance = (tokenData: any) => {
        const balance = tokenData.balance
        const decimals = tokenData.tokenMetadata.decimals || 0
        const divisor = BigInt(10 ** decimals)
        const formattedBalance = Number(balance) / Number(divisor)
        return formattedBalance.toFixed(decimals)
    }

    const parseAmount = (amountStr: string, decimals: number = 8): bigint => {
        // Replace comma with dot for decimal separator
        const normalizedAmount = amountStr.replace(',', '.')
        const amount = parseFloat(normalizedAmount)
        if (isNaN(amount) || amount <= 0) return BigInt(0)

        const multiplier = BigInt(10 ** decimals)
        return BigInt(Math.floor(amount * Number(multiplier)))
    }

    const validateTransfer = (): string | null => {
        if (!selectedTokenId) {
            return "Please select a token"
        }

        if (!amount.trim()) {
            return "Please enter an amount"
        }

        // Replace comma with dot for decimal separator
        const normalizedAmount = amount.replace(',', '.')
        const amountValue = parseFloat(normalizedAmount)
        if (isNaN(amountValue) || amountValue <= 0) {
            return "Amount must be greater than zero"
        }

        if (!selectedTokenBalance) {
            return "Selected token balance not found"
        }

        const availableBalance = Number(formatTokenBalance(selectedTokenBalance))
        if (amountValue > availableBalance) {
            return `Amount exceeds available balance (${availableBalance})`
        }

        if (!destinationAddress.trim()) {
            return "Please enter destination address"
        }

        if (!isValidAddress) {
            return "Invalid Spark address"
        }

        return null
    }

    const handleTransfer = async () => {
        const validationError = validateTransfer()
        if (validationError) {
            Alert.alert("Validation Error", validationError)
            return
        }

        if (!onTransfer || !selectedTokenBalance) return

        setTransferLoading(true)
        try {
            const decimals = selectedTokenBalance.tokenMetadata.decimals || 8
            const tokenAmount = parseAmount(amount, decimals)

            await onTransfer({
                tokenIdentifier: selectedTokenId as Bech32mTokenIdentifier,
                tokenAmount,
                receiverSparkAddress: destinationAddress.trim(),
            })

            // Reset form on success
            setSelectedTokenId("")
            setAmount("")
            setDestinationAddress("")

            Alert.alert("Success", "Token transfer initiated successfully!")
        } catch (error: any) {
            Alert.alert("Transfer Failed", error?.message || "Unknown error occurred")
        } finally {
            setTransferLoading(false)
        }
    }

    if (!tokenBalances || availableTokens.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Transfer Tokens</Text>
                    {onClose && (
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No tokens available for transfer</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Transfer Tokens</Text>
                {onClose && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Token Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Select Token:</Text>
                    <TouchableOpacity
                        style={styles.dropdownContainer}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={transferLoading}
                    >
                        <Text style={styles.dropdownText}>
                            {selectedTokenId && selectedTokenBalance
                                ? `${selectedTokenBalance.tokenMetadata.tokenName || selectedTokenId.substring(0, 20)}... (${formatTokenBalance(selectedTokenBalance)})`
                                : "Select a token..."
                            }
                        </Text>
                        <MaterialIcons
                            name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>

                    <Modal
                        visible={isDropdownOpen}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setIsDropdownOpen(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setIsDropdownOpen(false)}
                        >
                            <View style={styles.dropdownModal}>
                                <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                                    {availableTokens.map(([tokenId, tokenData]) => (
                                        <TouchableOpacity
                                            key={tokenId}
                                            style={[
                                                styles.dropdownItem,
                                                selectedTokenId === tokenId && styles.selectedDropdownItem
                                            ]}
                                            onPress={() => {
                                                setSelectedTokenId(tokenId)
                                                setIsDropdownOpen(false)
                                            }}
                                        >
                                            <View style={styles.dropdownItemContent}>
                                                <Text style={styles.dropdownItemName}>
                                                    {tokenData.tokenMetadata.tokenName || tokenId.substring(0, 30)}...
                                                </Text>
                                                <Text style={styles.dropdownItemBalance}>
                                                    {formatTokenBalance(tokenData)}
                                                </Text>
                                                <Text style={styles.dropdownItemSymbol}>
                                                    {tokenData.tokenMetadata.tokenTicker || 'TOKEN'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        editable={!transferLoading}
                    />
                    {selectedTokenBalance && (
                        <Text style={styles.balanceText}>
                            Available: {formatTokenBalance(selectedTokenBalance)}
                        </Text>
                    )}
                </View>

                {/* Destination Address */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Destination Spark Address:</Text>
                    <View style={styles.addressInputContainer}>
                        <TextInput
                            style={[
                                styles.textInput,
                                styles.addressInput,
                                destinationAddress && !isValidAddress && styles.invalidInput,
                                destinationAddress && isValidAddress && styles.validInput,
                            ]}
                            value={destinationAddress}
                            onChangeText={setDestinationAddress}
                            placeholder="Enter Spark address"
                            multiline
                            editable={!transferLoading}
                        />
                        <TouchableOpacity
                            style={styles.pasteButton}
                            onPress={handlePasteAddress}
                            disabled={transferLoading}
                        >
                            <MaterialIcons name="content-paste" size={20} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                    {destinationAddress && (
                        <Text style={[
                            styles.validationText,
                            isValidAddress ? styles.validText : styles.invalidText
                        ]}>
                            {isValidAddress ? "✓ Valid Spark address" : "✗ Invalid Spark address"}
                        </Text>
                    )}
                </View>

                {/* Transfer Button */}
                <TouchableOpacity
                    style={[
                        styles.transferButton,
                        (!selectedTokenId || !amount || !destinationAddress || !isValidAddress || transferLoading) && styles.disabledButton
                    ]}
                    onPress={handleTransfer}
                    disabled={!selectedTokenId || !amount || !destinationAddress || !isValidAddress || transferLoading}
                >
                    {transferLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <MaterialIcons name="send" size={20} color="white" />
                            <Text style={styles.transferButtonText}>Transfer Tokens</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}
