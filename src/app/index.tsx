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
    } = useWallet()

    const [showOpenForm, setShowOpenForm] = useState(false)
    const [mnemonic, setMnemonic] = useState("")
    const [txid, setTxid] = useState("")
    const [showClaimForm, setShowClaimForm] = useState(false)

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync()
        setMnemonic(text)
    }

    const handlePasteTxid = async () => {
        const text = await Clipboard.getStringAsync()
        setTxid(text)
    }

    const handleLogout = async () => {
        setShowOpenForm(false)
        setShowClaimForm(false)
        resetWalletState()
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.navbar}>
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
                                mnemonic={mnemonic}
                                onChangeMnemonic={setMnemonic}
                                onPaste={handlePaste}
                                onOpen={() => openWallet(mnemonic.trim())}
                            />
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    )
}
