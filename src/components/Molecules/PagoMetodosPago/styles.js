import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    wrapper: {
        borderRadius: normalize(12),
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    body: {
        backgroundColor: gb.gray50,
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(12),
        gap: normalize(8),
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: normalize(8),
    },
    btnContainer: {
        borderRadius: normalize(10),
        overflow: "hidden",
    },
    btn: {
        width: normalize(78),
        height: normalize(60),
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(4),
        borderWidth: 2,
        borderColor: gb.gray200,
        borderRadius: normalize(10),
        backgroundColor: gb.gray50,
    },
    btnActivo: {
        borderColor: gb.blue550,
        backgroundColor: gb.blue550 + "14",
    },
    btnTexto: {
        fontSize: normalize(10),
        fontWeight: "600",
        color: gb.gray600,
        textAlign: "center",
    },
    btnTextoActivo: {
        color: gb.blue550,
    },
});
