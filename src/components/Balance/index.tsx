import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { styles } from "./styles"

type Props = {
    balance: number | null
    loading: boolean
    onReload: () => void
}

export function Balance({ balance, loading, onReload }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <Text style={styles.label}>Bitcoin Balance</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                    <Text style={styles.value}>
                        {balance !== null
                            ? `${balance.toLocaleString("pt-BR")} sats`
                            : "--"}
                    </Text>
                )}
            </View>
            <TouchableOpacity onPress={onReload} style={styles.reloadButton} disabled={loading}>
                <MaterialIcons name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
        </View>
    )
}
