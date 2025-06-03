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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Clipboard from "expo-clipboard"
import { useWallet } from "@/hooks/useWallet"
import { Balance } from "@/components/Balance"
import { WalletOptions } from "@/components/WalletOptions"
import { OpenWalletForm } from "@/components/OpenWalletForm"
import { styles } from "@/app/styles"
import { MaterialIcons } from "@expo/vector-icons"

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
    } = useWallet()

    const [showOpenForm, setShowOpenForm] = useState(false)
    const [mnemonic, setMnemonic] = useState("")

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync()
        setMnemonic(text)
    }

    const handleLogout = async () => {
        setShowOpenForm(false)
        resetWalletState()
    }

    const showLogout = state === "ready"

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.navbar}>
                <Text style={styles.navbarTitle}>Spark</Text>
                {showLogout && (
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
                {state === "ready" ? (
                    <Balance
                        balance={balance}
                        loading={loading}
                        onReload={fetchBalance}
                    />
                ) : (
                    <>
                        {state === "error" && (
                            <Text style={styles.error}>{error}</Text>
                        )}
                        {loading && <ActivityIndicator size="large" />}
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
