import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    navbar: {
        width: "100%",
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        marginBottom: 16,
        position: "relative",
    },
    navbarTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    logoutButton: {
        position: "absolute",
        right: 16,
        padding: 8,
    },
    error: {
        color: "red",
    },
    sparkAddressWrapper: {
        width: "100%",
        paddingHorizontal: 24,
        alignItems: "center",
    },
    claimFormWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#fff",
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        alignItems: "center",
    },
    bottomButtonContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 32,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    walletButton: {
        position: "absolute",
        left: 16,
        padding: 8,
        zIndex: 10,
    },
})
