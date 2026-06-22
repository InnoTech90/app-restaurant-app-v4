import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
export const s = StyleSheet.create({
    constenerdorProducto: {
        backgroundColor: "white",
        paddingHorizontal: normalize(20),
        paddingVertical: normalize(10),
        borderRadius: normalize(12),
        marginBottom: normalize(10),
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: normalize(4),
        shadowOffset: { width: 0, height: normalize(2) },
        elevation: normalize(2),
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    tituloProducto: {
        fontSize: normalize(14),
        color: gb.gray800,
        fontWeight: "bold",
    },
    precioProducto: {
        fontSize: normalize(18),
        color: gb.green500,
        fontWeight: "bold",
    },
    textoProducto: {
        fontSize: normalize(12),
        color: gb.gray500,
    },
    contenedorComplementos: {
        marginTop: normalize(10),
        paddingTop: normalize(10),
       backgroundColor: gb.gray100,
       padding: normalize(10),
       borderRadius: normalize(8),
    },
    precioComplemento:{
        fontSize: normalize(14),
        color: gb.green500,
        fontWeight: "bold",
    }

})