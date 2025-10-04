import React, { useState } from "react"
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Button,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Clipboard from "expo-clipboard"
import { useWallet } from "@/hooks/useWallet"
import { Balance } from "@/components/Balance"
import { TokensBalance } from "@/components/TokensBalance"
import { TokenTransactions } from "@/components/TokenTransactions"
import { TransferTokens } from "@/components/TransferTokens"
import { WalletOptions } from "@/components/WalletOptions"
import { OpenWalletForm } from "@/components/OpenWalletForm"
import { ShowSparkAddressButton } from "@/components/ShowSparkAddressButton"
import { SparkAddressLabel } from "@/components/SparkAddressLabel"
import { styles } from "@/app/styles"
import { MaterialIcons } from "@expo/vector-icons"
import { ShowBitcoinAddressButton } from "@/components/ShowBitcoinAddressButton"
import { BitcoinAddressLabel } from "@/components/BitcoinAddressLabel"
import { ClaimDepositForm } from "@/components/ClaimDepositForm"
import { CreateLightningInvoiceForm } from "@/components/CreateLightningInvoiceForm"
import { CreateSparkSatsInvoiceForm } from "@/components/CreateSparkSatsInvoiceForm"
import { LightningInvoiceLabel } from "@/components/LightningInvoiceLabel"
import { WalletMnemonicLabel } from "@/components/WalletMnemonicLabel"
import { TransferForm } from "@/components/TransferForm"
import { PayLightningInvoiceForm } from "@/components/PayLightningInvoiceForm"
import { FulfillSparkInvoiceForm } from "@/components/FulfillSparkInvoiceForm"

export default function Index() {
    const {
        balance,
        walletStats,
        loading,
        state,
        error,
        createNewWallet,
        openWallet,
        fetchBalance,
        resetWalletState,
        sparkAddress,
        showSparkAddress,
        getSparkAddress,
        hideSparkAddress,
        bitcoinAddress,
        showBitcoinAddress,
        getBitcoinAddress,
        hideBitcoinAddress,
        claimDeposit,
        claimLoading,
        claimError,
        lightningInvoice,
        showLightningInvoice,
        createLightningInvoice,
        hideLightningInvoice,
        lightningLoading,
        lightningError,
        showMnemonic,
        showWalletMnemonic,
        hideWalletMnemonic,
        getMnemonic,
        transfer,
        transferLoading,
        transferError,
        payInvoiceLoading,
        payInvoiceError,
        lightningFeeEstimate,
        estimatingFee,
        estimateLightningFee,
        payLightningInvoice,
        clearLightningFeeEstimate,
        sparkSatsAddress,
        showSparkSatsAddress,
        createSparkSatsInvoice,
        hideSparkSatsAddress,
        sparkSatsLoading,
        sparkSatsError,

        // Fulfill Spark invoice
        fulfillSparkInvoice,
        fulfillSparkLoading,
        fulfillSparkError,
        fulfillSparkResult,

        // Token transactions
        queryTokenTransactions,
        queryTokenTransactionsLoading,
        queryTokenTransactionsError,
        queryTokenTransactionsResult,

        // Token transfer
        transferTokens,
        transferTokensLoading,
        transferTokensError,
        transferTokensResult,

        // Identity public key
        getIdentityPublicKey,
    } = useWallet()

    const [showOpenForm, setShowOpenForm] = useState(false)
    const [inputMnemonic, setInputMnemonic] = useState("")
    const [txid, setTxid] = useState("")
    const [showClaimForm, setShowClaimForm] = useState(false)
    const [showLightningForm, setShowLightningForm] = useState(false)
    const [amountSats, setAmountSats] = useState("")
    const [memo, setMemo] = useState("")
    const [showTransferForm, setShowTransferForm] = useState(false)
    const [receiverAddress, setReceiverAddress] = useState("")
    const [transferAmountSats, setTransferAmountSats] = useState("")
    const [showPayInvoiceForm, setShowPayInvoiceForm] = useState(false)
    const [lightningInvoiceInput, setLightningInvoiceInput] = useState("")
    const [showSparkSatsForm, setShowSparkSatsForm] = useState(false)
    const [sparkSatsAmount, setSparkSatsAmount] = useState("")
    const [sparkSatsMemo, setSparkSatsMemo] = useState("")

    // New local state for fulfill flow
    const [showFulfillSparkForm, setShowFulfillSparkForm] = useState(false)
    const [fulfillInvoiceInput, setFulfillInvoiceInput] = useState("")
    const [fulfillAmountSatsInput, setFulfillAmountSatsInput] = useState("")

    // Token transactions state
    const [showTokenTransactions, setShowTokenTransactions] = useState(false)

    // Token transfer state
    const [showTransferTokens, setShowTransferTokens] = useState(false)

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync()
        setInputMnemonic(text)
    }

    const handlePasteTxid = async () => {
        const text = await Clipboard.getStringAsync()
        setTxid(text)
    }

    const handlePasteAddress = async () => {
        const text = await Clipboard.getStringAsync()
        setReceiverAddress(text)
    }

    const handlePasteInvoice = async () => {
        const text = await Clipboard.getStringAsync()
        setLightningInvoiceInput(text)
    }

    const handlePasteInvoiceForFulfill = async () => {
        const text = await Clipboard.getStringAsync()
        setFulfillInvoiceInput(text)
    }

    const handleLogout = async () => {
        setShowOpenForm(false)
        setShowClaimForm(false)
        setShowLightningForm(false)
        setShowTransferForm(false)
        setShowPayInvoiceForm(false)
        setShowFulfillSparkForm(false)
        setShowTokenTransactions(false)
        setShowTransferTokens(false)
        setInputMnemonic("")
        setReceiverAddress("")
        setTransferAmountSats("")
        setLightningInvoiceInput("")
        setFulfillInvoiceInput("")
        setFulfillAmountSatsInput("")
        await resetWalletState()
    }

    const handleShowTokenTransactions = async () => {
        setShowTokenTransactions(true)

        try {
            // Get our wallet's identity public key
            const identityPublicKey = await getIdentityPublicKey()

            // Query token transactions filtered by our public key
            await queryTokenTransactions({
                ownerPublicKeys: [identityPublicKey]
            })
        } catch (error) {
            console.error("Error getting identity public key:", error)
            // Fallback to query without filter if getting public key fails
            await queryTokenTransactions({})
        }
    }

    const handleHideTokenTransactions = () => {
        setShowTokenTransactions(false)
    }

    const handleShowTransferTokens = () => {
        setShowTransferTokens(true)
    }

    const handleHideTransferTokens = () => {
        setShowTransferTokens(false)
    }

    const handleTransferTokens = async (params: {
        tokenIdentifier: string
        tokenAmount: bigint
        receiverSparkAddress: string
    }) => {
        await transferTokens({
            tokenIdentifier: params.tokenIdentifier as any,
            tokenAmount: params.tokenAmount,
            receiverSparkAddress: params.receiverSparkAddress,
        })
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.navbar}>
                {state === "ready" && (
                    <TouchableOpacity
                        onPress={showWalletMnemonic}
                        style={styles.walletButton}
                        accessibilityLabel="Show Mnemonic"
                    >
                        <MaterialIcons
                            name="account-balance-wallet"
                            size={24}
                            color="#007AFF"
                        />
                    </TouchableOpacity>
                )}

                <Text style={styles.navbarTitle}>Spark</Text>

                {state === "ready" && (
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                        accessibilityLabel="Logout"
                    >
                        <MaterialIcons
                            name="logout"
                            size={24}
                            color="#007AFF"
                        />
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        {error && <Text style={styles.error}>{error}</Text>}

                        {state === "ready" ? (
                            <>
                                <Balance
                                    balance={balance}
                                    loading={loading}
                                    onReload={fetchBalance}
                                />
                                <TokensBalance tokenBalance={walletStats?.tokenBalances} loading={loading} onReload={fetchBalance} />

                                {/* Transfer Tokens Button */}
                                {!showTransferTokens && (
                                    <Button
                                        title="Transfer Tokens"
                                        onPress={handleShowTransferTokens}
                                    />
                                )}

                                {/* Transfer Tokens Component */}
                                {showTransferTokens && (
                                    <TransferTokens
                                        tokenBalances={walletStats?.tokenBalances}
                                        loading={transferTokensLoading}
                                        onTransfer={handleTransferTokens}
                                        onClose={handleHideTransferTokens}
                                    />
                                )}

                                {/* Token Transactions Button */}
                                {!showTokenTransactions && (
                                    <Button
                                        title="View Token Transactions"
                                        onPress={handleShowTokenTransactions}
                                    />
                                )}

                                {/* Token Transactions Component */}
                                {showTokenTransactions && (
                                    <TokenTransactions
                                        transactions={queryTokenTransactionsResult}
                                        loading={queryTokenTransactionsLoading}
                                        error={queryTokenTransactionsError}
                                        onReload={async () => {
                                            try {
                                                const identityPublicKey = await getIdentityPublicKey()
                                                await queryTokenTransactions({
                                                    ownerPublicKeys: [identityPublicKey]
                                                })
                                            } catch (error) {
                                                console.error("Error getting identity public key:", error)
                                                await queryTokenTransactions({})
                                            }
                                        }}
                                        onClose={handleHideTokenTransactions}
                                    />
                                )}

                                {!showSparkAddress ? (
                                    <ShowSparkAddressButton
                                        onShow={getSparkAddress}
                                        loading={loading}
                                    />
                                ) : (
                                    sparkAddress && (
                                        <View
                                            style={styles.sparkAddressWrapper}
                                        >
                                            <SparkAddressLabel
                                                address={sparkAddress}
                                                onCopied={hideSparkAddress}
                                            />
                                        </View>
                                    )
                                )}
                                {!showBitcoinAddress ? (
                                    <ShowBitcoinAddressButton
                                        onShow={getBitcoinAddress}
                                        loading={loading}
                                    />
                                ) : (
                                    bitcoinAddress && (
                                        <View
                                            style={styles.sparkAddressWrapper}
                                        >
                                            <BitcoinAddressLabel
                                                address={bitcoinAddress}
                                                onCopied={hideBitcoinAddress}
                                            />
                                        </View>
                                    )
                                )}
                                {!showClaimForm && (
                                    <Button
                                        title="Claim Bitcoin Transfer"
                                        onPress={() => setShowClaimForm(true)}
                                    />
                                )}
                                {showClaimForm && (
                                    <ClaimDepositForm
                                        txid={txid}
                                        onChangeTxid={setTxid}
                                        onPaste={handlePasteTxid}
                                        onClaim={() =>
                                            claimDeposit(txid.trim())
                                        }
                                        onClose={() => setShowClaimForm(false)}
                                        loading={claimLoading}
                                        error={claimError}
                                    />
                                )}
                                {!showLightningInvoice &&
                                    !showLightningForm && (
                                        <Button
                                            title="Create Lightning Invoice"
                                            onPress={() =>
                                                setShowLightningForm(true)
                                            }
                                        />
                                    )}
                                {showLightningForm && (
                                    <CreateLightningInvoiceForm
                                        amountSats={amountSats}
                                        memo={memo}
                                        onChangeAmountSats={setAmountSats}
                                        onChangeMemo={setMemo}
                                        onGenerate={() => {
                                            const amount =
                                                parseInt(amountSats) || 0
                                            createLightningInvoice(amount, memo)
                                        }}
                                        onClose={() =>
                                            setShowLightningForm(false)
                                        }
                                        loading={lightningLoading}
                                        error={lightningError}
                                    />
                                )}
                                {showLightningInvoice && lightningInvoice && (
                                    <View style={styles.sparkAddressWrapper}>
                                        <LightningInvoiceLabel
                                            invoice={lightningInvoice}
                                            onCopied={() => {
                                                hideLightningInvoice()
                                                setShowLightningForm(false)
                                                setAmountSats("")
                                                setMemo("")
                                            }}
                                        />
                                    </View>
                                )}
                                {!showTransferForm && (
                                    <Button
                                        title="Send Transfer"
                                        onPress={() =>
                                            setShowTransferForm(true)
                                        }
                                    />
                                )}
                                {showTransferForm && (
                                    <TransferForm
                                        receiverAddress={receiverAddress}
                                        amountSats={transferAmountSats}
                                        onChangeReceiverAddress={
                                            setReceiverAddress
                                        }
                                        onChangeAmountSats={
                                            setTransferAmountSats
                                        }
                                        onPasteAddress={handlePasteAddress}
                                        onTransfer={async () => {
                                            const amount =
                                                parseInt(transferAmountSats) ||
                                                0
                                            try {
                                                await transfer(
                                                    receiverAddress.trim(),
                                                    amount
                                                )
                                                // Only close form if transfer was successful (no error thrown)
                                                setShowTransferForm(false)
                                                setReceiverAddress("")
                                                setTransferAmountSats("")
                                            } catch (error) {
                                                // Error is already handled in the hook, just don't close the form
                                                console.log(
                                                    "Transfer failed, keeping form open"
                                                )
                                            }
                                        }}
                                        onClose={() => {
                                            setShowTransferForm(false)
                                            setReceiverAddress("")
                                            setTransferAmountSats("")
                                        }}
                                        loading={transferLoading}
                                        error={transferError}
                                    />
                                )}
                                {!showPayInvoiceForm && (
                                    <Button
                                        title="Pay Invoice"
                                        onPress={() =>
                                            setShowPayInvoiceForm(true)
                                        }
                                    />
                                )}
                                {showPayInvoiceForm && (
                                    <PayLightningInvoiceForm
                                        invoice={lightningInvoiceInput}
                                        feeEstimate={lightningFeeEstimate}
                                        onChangeInvoice={
                                            setLightningInvoiceInput
                                        }
                                        onPasteInvoice={handlePasteInvoice}
                                        onEstimateFee={() =>
                                            estimateLightningFee(
                                                lightningInvoiceInput.trim()
                                            )
                                        }
                                        onPayInvoice={async () => {
                                            if (lightningFeeEstimate !== null) {
                                                try {
                                                    await payLightningInvoice(
                                                        lightningInvoiceInput.trim(),
                                                        lightningFeeEstimate +
                                                            100 // Add some buffer to the fee
                                                    )
                                                    // Only close form if payment was successful
                                                    setShowPayInvoiceForm(false)
                                                    setLightningInvoiceInput("")
                                                } catch (error) {
                                                    // Error is already handled in the hook, just don't close the form
                                                    console.log(
                                                        "Payment failed, keeping form open"
                                                    )
                                                }
                                            }
                                        }}
                                        onClose={() => {
                                            setShowPayInvoiceForm(false)
                                            setLightningInvoiceInput("")
                                            clearLightningFeeEstimate()
                                        }}
                                        loading={payInvoiceLoading}
                                        estimatingFee={estimatingFee}
                                        error={payInvoiceError}
                                    />
                                )}
                                {/* Button to open fulfill spark invoice form */}
                                {!showFulfillSparkForm && (
                                    <Button
                                        title="Fulfill Spark Invoice"
                                        onPress={() =>
                                            setShowFulfillSparkForm(true)
                                        }
                                    />
                                )}

                                {showFulfillSparkForm && (
                                    <FulfillSparkInvoiceForm
                                        invoice={fulfillInvoiceInput}
                                        amountSats={fulfillAmountSatsInput}
                                        onChangeInvoice={setFulfillInvoiceInput}
                                        onChangeAmountSats={
                                            setFulfillAmountSatsInput
                                        }
                                        onFulfill={async () => {
                                            const amount =
                                                parseInt(
                                                    fulfillAmountSatsInput
                                                ) || undefined
                                            try {
                                                await fulfillSparkInvoice(
                                                    fulfillInvoiceInput.trim(),
                                                    amount
                                                )
                                                // Close form on success
                                                setShowFulfillSparkForm(false)
                                                setFulfillInvoiceInput("")
                                                setFulfillAmountSatsInput("")
                                            } catch {
                                                // Keep form open on failure
                                            }
                                        }}
                                        onClose={() => {
                                            setShowFulfillSparkForm(false)
                                            setFulfillInvoiceInput("")
                                            setFulfillAmountSatsInput("")
                                        }}
                                        loading={fulfillSparkLoading}
                                        error={fulfillSparkError}
                                        result={fulfillSparkResult || undefined}
                                    />
                                )}

                                {/* Existing "Create Spark Address" (will show friendly error if unsupported) */}
                                {!showSparkSatsAddress &&
                                    !showSparkSatsForm && (
                                        <Button
                                            title="Create Spark Address"
                                            onPress={() =>
                                                setShowSparkSatsForm(true)
                                            }
                                        />
                                    )}

                                {showSparkSatsForm && (
                                    <CreateSparkSatsInvoiceForm
                                        amountSats={sparkSatsAmount}
                                        memo={sparkSatsMemo}
                                        onChangeAmountSats={setSparkSatsAmount}
                                        onChangeMemo={setSparkSatsMemo}
                                        onGenerate={() => {
                                            const amount =
                                                parseInt(sparkSatsAmount) || 0
                                            createSparkSatsInvoice(
                                                amount,
                                                sparkSatsMemo
                                            )
                                        }}
                                        onClose={() =>
                                            setShowSparkSatsForm(false)
                                        }
                                        loading={sparkSatsLoading}
                                        error={sparkSatsError}
                                    />
                                )}

                                {showSparkSatsAddress && sparkSatsAddress && (
                                    <View style={styles.sparkAddressWrapper}>
                                        <SparkAddressLabel
                                            address={sparkSatsAddress}
                                            onCopied={() => {
                                                hideSparkSatsAddress()
                                                setShowSparkSatsForm(false)
                                                setSparkSatsAmount("")
                                                setSparkSatsMemo("")
                                            }}
                                        />
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                {!loading && !showOpenForm && (
                                    <WalletOptions
                                        onCreate={createNewWallet}
                                        onOpen={() => setShowOpenForm(true)}
                                    />
                                )}
                                {!loading && showOpenForm && (
                                    <OpenWalletForm
                                        mnemonic={inputMnemonic}
                                        onChangeMnemonic={setInputMnemonic}
                                        onPaste={handlePaste}
                                        onOpen={() =>
                                            openWallet(inputMnemonic.trim())
                                        }
                                    />
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {showMnemonic && (
                <WalletMnemonicLabel
                    mnemonic={getMnemonic()}
                    onCopied={hideWalletMnemonic}
                />
            )}
        </SafeAreaView>
    )
}
