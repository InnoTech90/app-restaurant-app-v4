import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    contenedor: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(13),
        borderTopWidth: 1,
        borderColor: gb.gray200,
        backgroundColor: gb.gray50,
        borderRadius: normalize(10),

    },
    info: {
        flex: 1,
        marginRight: normalize(12),
    },
    nombre: {
        fontSize: normalize(14),
        fontWeight: "bold",
        color: gb.gray800,
    },
    nombreCorto: {
        fontSize: normalize(11),
        color: gb.gray400,
        marginTop: normalize(2),
    },
    precioContainer: {
        alignItems: "flex-end",
    },
    precio: {
        fontSize: normalize(16),
        fontWeight: "bold",
        color: gb.green500,
    },
});
