import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    buscadorWrapper: {
        paddingVertical: normalize(10),
    },
    vacio: {
        textAlign: "center",
        marginTop: normalize(40),
        fontSize: normalize(14),
        color: gb.gray400,
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    itemBoton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(12),
        gap: normalize(12),
        backgroundColor: "transparent",
        borderRadius: 0,
    },
    avatar: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        backgroundColor: gb.blue200,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarTexto: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: gb.blue550,
    },
    nombre: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: gb.gray800,
    },
    telefono: {
        fontSize: normalize(12),
        color: gb.gray400,
        marginTop: normalize(2),
    },
});
