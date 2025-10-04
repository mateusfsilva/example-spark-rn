import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginVertical: 4,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        flexShrink: 0,
    },
    reloadButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 12,
        flexShrink: 0,
    },
    scrollView: {
        maxHeight: 60,
    },
    tokenItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
    },
    tokenInfo: {
        flex: 1,
        marginRight: 16,
    },
    tokenName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    tokenTicker: {
        fontSize: 14,
        color: "#6c757d",
        marginTop: 4,
    },
    tokenBalance: {
        fontSize: 18,
        fontWeight: "700",
        color: "#007AFF",
        textAlign: "right",
        minWidth: 100,
        flexShrink: 0,
    },
    noTokensText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        paddingVertical: 8,
    },
})
