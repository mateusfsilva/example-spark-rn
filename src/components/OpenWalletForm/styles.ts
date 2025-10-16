import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    flex: {
        flex: 1,
        width: "100%",
        justifyContent: "space-between",
    },
    formContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        width: "100%",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 16,
        width: "100%",
        minHeight: 120,
        fontSize: 18,
        marginBottom: 16,
        backgroundColor: "#fafafa",
    },
    openButtonContainer: {
        width: "100%",
        padding: 24,
        paddingBottom: 40,
        backgroundColor: "#fff",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 8,
    },
    checkbox: {
        marginRight: 12,
    },
    checkboxLabel: {
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    validationText: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
        fontWeight: "500",
    },
    validationSuccess: {
        color: "#4CAF50",
    },
    validationError: {
        color: "#F44336",
    },
})
