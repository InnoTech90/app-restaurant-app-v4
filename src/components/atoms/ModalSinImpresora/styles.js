import { StyleSheet } from "react-native";
import { gb } from "../../../screens/_globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    body: {
        alignItems: "center",
        paddingVertical: normalize(10),
        paddingHorizontal: normalize(8),
        gap: normalize(12),
    },
    iconBox: {
        width: normalize(68),
        height: normalize(68),
        borderRadius: normalize(34),
        backgroundColor: "#FFF3E0",
        justifyContent: "center",
        alignItems: "center",
    },
    mensaje: {
        fontSize: normalize(14),
        color: gb.gray700,
        textAlign: "center",
        lineHeight: normalize(20),
        fontWeight: "600",
    },
    nombreBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
        backgroundColor: gb.blue50,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(8),
        borderWidth: 1,
        borderColor: gb.blue200,
    },
    nombreImpresora: {
        fontSize: normalize(13),
        color: gb.blue550,
        fontWeight: "700",
    },
    pregunta: {
        fontSize: normalize(13),
        color: gb.gray500,
        textAlign: "center",
    },
    botones: {
        flexDirection: "row",
        gap: normalize(10),
        width: "100%",
        marginTop: normalize(4),
    },
    btnNo: {
        flex: 1,
        height: normalize(44),
        borderRadius: normalize(22),
        backgroundColor: gb.gray100,
        borderWidth: 1,
        borderColor: gb.gray300,
        alignItems: "center",
        justifyContent: "center",
    },
    btnNoTexto: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: gb.gray500,
    },
    btnSiContainer: {
        flex: 1,
        borderRadius: normalize(22),
        overflow: "hidden",
    },
    btnSi: {
        height: normalize(44),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    btnSiTexto: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: "white",
    },
    btnContinuarContainer: {
        width: '100%',
        borderRadius: normalize(22),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: gb.gray300,
    },
    btnContinuar: {
        height: normalize(44),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: gb.gray100,
    },
    btnContinuarTexto: {
        fontSize: normalize(13),
        fontWeight: '600',
        color: gb.gray500,
    },
});
