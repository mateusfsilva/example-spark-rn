import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    container: {
        backgroundColor: "#fff",
        margin: 24,
        padding: 24,
        borderRadius: 12,
        maxWidth: "90%",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    mnemonicContainer: {
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    mnemonic: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 8,
    },
    hint: {
        fontSize: 12,
        color: "#888",
        textAlign: "center",
    },
})
