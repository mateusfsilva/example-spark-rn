import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 24,
        alignItems: "center",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    hint: {
        width: "100%",
        color: "#666",
        marginBottom: 8,
        fontSize: 12,
    },
    buttonRow: {
        width: "100%",
        gap: 12,
        marginTop: 8,
    },
    error: {
        color: "red",
        marginTop: 12,
        textAlign: "center",
        paddingHorizontal: 8,
    },
    result: {
        color: "#111",
        marginTop: 12,
        textAlign: "center",
        paddingHorizontal: 8,
    },
})
