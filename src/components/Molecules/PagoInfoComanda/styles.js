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
        gap: normalize(8),
    },
    label: {
        fontSize: normalize(12),
        color: gb.gray400,
        width: normalize(58),
    },
    valor: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.gray800,
        flex: 1,
    },
    clienteBtnContainer: {
        flex: 1,
        borderRadius: normalize(20),
        overflow: "hidden",
    },
    clienteBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        backgroundColor: gb.blue550 + "14",
        borderRadius: normalize(20),
    },
    clienteBtnTexto: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.blue550,
    },
});
