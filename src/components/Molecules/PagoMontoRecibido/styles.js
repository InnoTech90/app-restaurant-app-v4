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
    montoWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: gb.gray100,
        borderRadius: normalize(10),
        borderWidth: 1,
        borderColor: gb.gray200,
        paddingHorizontal: normalize(12),
        gap: normalize(8),
    },
    simbolo: {
        fontSize: normalize(20),
        fontWeight: "800",
        color: gb.gray400,
    },
    input: {
        flex: 1,
        fontSize: normalize(24),
        fontWeight: "800",
        color: gb.gray900,
        paddingVertical: normalize(10),
    },
    cambioRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: normalize(4),
    },
    cambioLabel: {
        fontSize: normalize(13),
        color: gb.gray500,
    },
    cambioValor: {
        fontSize: normalize(16),
        fontWeight: "800",
        color: gb.green500,
    },
    cambioValorNegativo: {
        color: gb.red600,
    },
});
