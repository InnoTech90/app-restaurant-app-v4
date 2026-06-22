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
    listaHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: normalize(6),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray200,
        gap: normalize(8),
    },
    listaHeaderTexto: {
        fontSize: normalize(11),
        fontWeight: "700",
        color: gb.gray400,
        textTransform: "uppercase",
    },
    articuloRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(8),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
        gap: normalize(8),
    },
    articuloInfo: {
        flex: 1,
    },
    articuloNombre: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.gray800,
    },
    articuloMeta: {
        flexDirection: "row",
        gap: normalize(4),
        marginTop: normalize(2),
    },
    articuloPrecio: {
        fontSize: normalize(11),
        color: gb.gray400,
    },
    articuloComps: {
        fontSize: normalize(11),
        color: gb.purple550,
    },
    inputCantidad: {
        width: normalize(100),
    },
    articuloTotal: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.blue550,
        minWidth: normalize(52),
        textAlign: "right",
    },
    btnEliminarContainer: {
        borderRadius: normalize(18),
        overflow: "hidden",
    },
    btnEliminar: {
        width: normalize(34),
        height: normalize(34),
        backgroundColor: gb.red50,
        alignItems: "center",
        justifyContent: "center",
    },
    notasInput: {
        backgroundColor: gb.gray100,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(8),
        fontSize: normalize(13),
        color: gb.gray800,
        minHeight: normalize(60),
        maxHeight: normalize(100),
        borderWidth: 1,
        borderColor: gb.gray200,
        textAlignVertical: "top",
    },
    vacio: {
        textAlign: "center",
        paddingVertical: normalize(20),
        fontSize: normalize(13),
        color: gb.gray400,
    },
});
