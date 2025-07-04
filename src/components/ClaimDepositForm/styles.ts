import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    keyboardContainer: {
        width: "100%",
    },
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
        minHeight: 48,
    },
    spacer: {
        height: 8,
    },
    loading: {
        marginTop: 8,
    },
    error: {
        color: "red",
        marginTop: 8,
        textAlign: "center",
    },
})
