import "@azure/core-asynciterator-polyfill"
import { Buffer } from "buffer"
import "text-encoding"
global.Buffer = Buffer

import React, { useState } from "react"
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Button,
    TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Clipboard from "expo-clipboard"
import { useWallet } from "@/hooks/useWallet"
import { Balance } from "@/components/Balance"
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
import { LightningInvoiceLabel } from "@/components/LightningInvoiceLabel"
import { WalletMnemonicLabel } from "@/components/WalletMnemonicLabel"

export default function Index() {
    const {
        balance,
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
    } = useWallet()

    const [showOpenForm, setShowOpenForm] = useState(false)
    const [inputMnemonic, setInputMnemonic] = useState("")
    const [txid, setTxid] = useState("")
    const [showClaimForm, setShowClaimForm] = useState(false)
    const [showLightningForm, setShowLightningForm] = useState(false)
    const [amountSats, setAmountSats] = useState("")
    const [memo, setMemo] = useState("")

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync()
        setInputMnemonic(text)
    }

    const handlePasteTxid = async () => {
        const text = await Clipboard.getStringAsync()
        setTxid(text)
    }

    const handleLogout = async () => {
        setShowOpenForm(false)
        setShowClaimForm(false)
        setShowLightningForm(false)
        setInputMnemonic("")
        resetWalletState()
    }

    // Add this for debugging
    console.log("showMnemonic state:", showMnemonic)
    console.log("getMnemonic():", getMnemonic())

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

            <View style={styles.container}>
                {error && <Text style={styles.error}>{error}</Text>}

                {state === "ready" ? (
                    <>
                        <Balance
                            balance={balance}
                            loading={loading}
                            onReload={fetchBalance}
                        />
                        {!showSparkAddress ? (
                            <ShowSparkAddressButton
                                onShow={getSparkAddress}
                                loading={loading}
                            />
                        ) : (
                            sparkAddress && (
                                <View style={styles.sparkAddressWrapper}>
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
                                <View style={styles.sparkAddressWrapper}>
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
                                onClaim={() => claimDeposit(txid.trim())}
                                onClose={() => setShowClaimForm(false)}
                                loading={claimLoading}
                                error={claimError}
                            />
                        )}
                        {!showLightningInvoice && !showLightningForm && (
                            <Button
                                title="Create Lightning Invoice"
                                onPress={() => setShowLightningForm(true)}
                            />
                        )}
                        {showLightningForm && (
                            <CreateLightningInvoiceForm
                                amountSats={amountSats}
                                memo={memo}
                                onChangeAmountSats={setAmountSats}
                                onChangeMemo={setMemo}
                                onGenerate={() => {
                                    const amount = parseInt(amountSats) || 0
                                    createLightningInvoice(amount, memo)
                                }}
                                onClose={() => setShowLightningForm(false)}
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
                                onOpen={() => openWallet(inputMnemonic.trim())}
                            />
                        )}
                    </>
                )}
            </View>

            {/* Debug the conditional rendering */}
            {console.log(
                "Rendering mnemonic overlay:",
                showMnemonic && getMnemonic()
            )}
            {showMnemonic && (
                <WalletMnemonicLabel
                    mnemonic={getMnemonic()}
                    onCopied={hideWalletMnemonic}
                />
            )}
        </SafeAreaView>
    )
}
