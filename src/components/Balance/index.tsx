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
            <Text style={styles.label}>Saldo:</Text>
            {loading ? (
                <ActivityIndicator size="small" />
            ) : (
                <Text style={styles.value}>
                    {balance !== null
                        ? balance.toLocaleString("pt-BR") + " sats"
                        : "--"}
                </Text>
            )}
            <TouchableOpacity onPress={onReload} style={styles.reloadButton}>
                <MaterialIcons name="refresh" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    )
}
