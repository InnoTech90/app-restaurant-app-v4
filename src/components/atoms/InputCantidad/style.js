import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    contenedor: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: gb.blue100,
        borderRadius: normalize(8),
        backgroundColor: gb.gray50,
        overflow: "hidden",
    },
    boton: {
        width: normalize(42),
        height: normalize(42),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: gb.blue550,
    },
    botonDeshabilitado: {
        backgroundColor: gb.gray300,
    },
    botonTexto: {
        fontSize: normalize(22),
        fontWeight: "700",
        color: gb.gray50,
        lineHeight: normalize(26),
    },
    botonTextoDeshabilitado: {
        color: gb.gray400,
    },
    valorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: normalize(12),
    },
    valor: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: gb.gray800,
    },
    botonSmall: {
        width: normalize(34),
        height: normalize(36),
    },
    botonTextoSmall: {
        fontSize: normalize(18),
        lineHeight: normalize(22),
    },
    valorContainerSmall: {
        paddingHorizontal: normalize(4),
    },
});
