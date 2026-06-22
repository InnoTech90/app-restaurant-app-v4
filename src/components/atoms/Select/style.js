import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    contenedor: {
        width: "100%",
    },
    label: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.gray700,
        marginBottom: normalize(4),
    },
    selector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: normalize(40),
        borderWidth: 1,
        borderColor: gb.blue100,
        borderRadius: normalize(5),
        backgroundColor: gb.gray50,
        paddingHorizontal: normalize(10),
    },
    textoSelector: {
        flex: 1,
        fontSize: normalize(14),
        color: gb.gray800,
    },
    placeholder: {
        color: gb.gray300,
    },
    icono: {
        color: gb.gray400,
        marginLeft: normalize(6),
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        paddingHorizontal: normalize(24),
    },
    dropdown: {
        backgroundColor: gb.gray50,
        borderRadius: normalize(10),
        maxHeight: normalize(280),
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: normalize(8),
        shadowOffset: { width: 0, height: normalize(4) },
        elevation: 6,
    },
    opcion: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(13),
        borderBottomWidth: 1,
        borderColor: gb.gray200,
    },
    opcionActiva: {
        backgroundColor: gb.blue100,
    },
    textoOpcion: {
        fontSize: normalize(14),
        color: gb.gray800,
    },
    textoOpcionActivo: {
        fontWeight: "700",
        color: gb.blue550,
    },
    iconoCheck: {
        color: gb.blue550,
    },
});
