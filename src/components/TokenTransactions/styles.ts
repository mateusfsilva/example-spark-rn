import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        marginVertical: 4,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        flexShrink: 0,
    },
    closeButton: {
        backgroundColor: "#FF4444",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    closeButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    scrollView: {
        maxHeight: 400,
    },
    transactionItem: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 12,
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    transactionId: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 60,
        alignItems: "center",
    },
    statusText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    transactionDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 14,
        color: "#6c757d",
        fontWeight: "600",
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: "#1a1a1a",
        fontWeight: "500",
        flex: 2,
        textAlign: "right",
    },
    errorContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    errorText: {
        fontSize: 14,
        color: "#F44336",
        textAlign: "center",
        marginBottom: 12,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginBottom: 12,
    },
    reloadButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    reloadButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
})
