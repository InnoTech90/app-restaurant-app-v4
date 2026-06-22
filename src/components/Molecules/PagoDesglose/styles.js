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
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: normalize(4),
    },
    rowLabel: {
        fontSize: normalize(13),
        color: gb.gray600,
    },
    rowValor: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.gray800,
    },
    divider: {
        height: 1,
        backgroundColor: gb.gray200,
        marginVertical: normalize(6),
    },
    totalLabel: {
        fontSize: normalize(16),
        fontWeight: "800",
        color: gb.gray900,
    },
    totalValor: {
        fontSize: normalize(22),
        fontWeight: "900",
        color: gb.green500,
    },
    btnDividirContainer: {
        borderRadius: normalize(8),
        overflow: "hidden",
        marginTop: normalize(4),
    },
    btnDividir: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(10),
        gap: normalize(8),
        backgroundColor: gb.purple550 + "20",
        borderRadius: normalize(8),
        borderWidth: 1,
        borderColor: gb.purple550 + "50",
    },
    btnDividirTexto: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.purple550,
    },
});
