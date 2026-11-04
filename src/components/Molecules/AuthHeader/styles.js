import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
    header:{

    },
    containerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 40,
    },
    title:{
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    rightActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minWidth: 70,
        justifyContent: "flex-end",
    },
    ordersBadgeBtn: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#DC2626",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
    },
    ordersBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    buscadorContainer:{
        
    },
    buscador:{

    }

});
