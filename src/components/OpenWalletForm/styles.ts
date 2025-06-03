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
})
