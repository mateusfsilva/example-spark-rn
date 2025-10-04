import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        minHeight: 32, // Define altura mínima para evitar sobreposição
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flexShrink: 0, // Não permite que o título seja comprimido
    },
    reloadButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
        flexShrink: 0, // Não permite que o botão seja comprimido
    },
    reloadButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
    scrollView: {
        maxHeight: 120, // Reduz altura máxima para evitar espaço branco
        paddingHorizontal: 4, // Adiciona padding lateral sutil
    },
    tokenItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start", // Alinha ao topo para dar mais espaço
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        minHeight: 60, // Aumenta altura mínima
    },
    tokenInfo: {
        flex: 1,
        marginRight: 12, // Espaçamento entre token info e balance
    },
    tokenName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    tokenTicker: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    tokenBalance: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
        textAlign: "right",
        minWidth: 80, // Largura mínima para o saldo
        flexShrink: 0, // Não permite redução do tamanho
        alignSelf: "flex-start", // Alinha com o topo do item
        marginTop: 2, // Pequeno offset para alinhar com o texto principal
    },
    noTokensText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        paddingVertical: 8,
    },
})
