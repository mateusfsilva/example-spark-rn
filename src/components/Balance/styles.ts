import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 16,
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginRight: 8,
    },
    value: {
        fontSize: 18,
        color: "#222",
        marginRight: 8,
    },
    reloadButton: {
        padding: 4,
    },
})
