import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    keyboardContainer: {
        width: "100%",
    },
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
    memoInput: {
        minHeight: 80,
    },
    spacer: {
        height: 12,
    },
    loading: {
        marginTop: 12,
    },
    error: {
        color: "red",
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 8,
    },
})
