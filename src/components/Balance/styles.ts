import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginVertical: 4,
    },
    leftSection: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    label: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginRight: 12,
    },
    value: {
        fontSize: 24,
        fontWeight: "800",
        color: "#007AFF",
    },
    reloadButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
})
