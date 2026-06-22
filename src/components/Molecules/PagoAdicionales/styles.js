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
        minHeight: normalize(42),
    },
    label: {
        fontSize: normalize(13),
        color: gb.gray700,
        flex: 1,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: gb.gray100,
        borderRadius: normalize(8),
        borderWidth: 1,
        borderColor: gb.gray200,
        overflow: "hidden",
    },
    input: {
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(6),
        fontSize: normalize(13),
        color: gb.gray800,
        width: normalize(80),
        textAlign: "right",
    },
    inputSufijo: {
        paddingRight: normalize(8),
        color: gb.gray400,
        fontSize: normalize(13),
    },
    toggleBtn: {
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(7),
        backgroundColor: gb.gray200,
    },
    toggleBtnActivo: {
        backgroundColor: gb.blue550,
    },
    toggleBtnTexto: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: gb.gray600,
    },
    toggleBtnTextoActivo: {
        color: gb.gray50,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8),
    },
    checkbox: {
        width: normalize(20),
        height: normalize(20),
        borderRadius: normalize(4),
        borderWidth: 2,
        borderColor: gb.gray300,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxActivo: {
        borderColor: gb.blue550,
        backgroundColor: gb.blue550,
    },
    checkboxLabel: {
        fontSize: normalize(12),
        color: gb.gray600,
    },
});
