import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 24,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        width: "100%",
        marginBottom: 8,
        fontSize: 16,
        minHeight: 80,
    },
    buttonContainer: {
        marginBottom: 8,
    },
    feeEstimate: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF",
        textAlign: "center",
        marginVertical: 8,
        padding: 8,
        backgroundColor: "#f0f8ff",
        borderRadius: 8,
    },
    estimatingText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 8,
    },
    actionButtons: {
        marginTop: 16,
    },
    error: {
        color: "red",
        marginTop: 8,
        textAlign: "center",
    },
})
