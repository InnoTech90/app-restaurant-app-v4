import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
    scroll: {
    },
    container: {
        flex: 1,
        alignItems: "center",
        padding: normalize(20),
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    filtros: {
        backgroundColor: "white",
        width: "100%",
        height: normalize(50),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        gap: normalize(10),
    },

    ButtonFiltro: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: normalize(20),
        justifyContent: "center",
        alignItems: "center",
        
        backgroundColor: 'transparent',
    },
    botonFiltroSeleccionado: {

        flex: 1,
        borderWidth: 1,
        borderColor: gb.purple500,
        backgroundColor: gb.purple550,
        borderRadius: normalize(20),
        justifyContent: "center",
        alignItems: "center",
    },
    buttonCOntainer: {
        height: normalize(40),
        flex: 1,
        paddingHorizontal: normalize(2),
        paddingVertical: normalize(2),
    },
    buttonContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: normalize(5),
        height: normalize(20),

    },
    header: {
        width: "100%",
        height: normalize(50),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    btnLimpiar: {
        backgroundColor: 'transparent', // Agrega opacidad al color de fondo
        borderWidth: 1,
        borderColor: gb.gray50, // Agrega opacidad al color del borde
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        height: normalize(35),
        borderRadius: normalize(20),
        flexDirection: "row",
    },
    btnLimpiarText:
    {
        color: gb.gray50,
        fontSize: normalize(14),
        marginLeft: normalize(5),

    },
    totalesContainer: {
        width: "100%",
        flexDirection: "row",
        gap: normalize(10),
        backgroundColor: "white",
        paddingBottom: normalize(10),
        justifyContent: "space-around",
        alignItems: "center",

    },
    totalFiltrado: {
        width: '40%',
        height: normalize(40),
        backgroundColor: gb.blue550,
        borderRadius: normalize(12),

        alignItems: "center",
        justifyContent: "center",
    },
    totalGeneral: {
        width: '40%',
        height: normalize(40),
        backgroundColor: gb.blue400,
        borderRadius: normalize(12),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    precio: {
        color: gb.gray50,
        fontSize: normalize(18),
        fontWeight: "bold",
    },
    descripcion: {
        color: gb.gray50,
        fontSize: normalize(10),
    },
    ventasContainer: {
        width: "100%",
        marginTop: normalize(10),
    },
    titleDetalleVenta: {
        fontSize: normalize(12),
        color: gb.gray50,
    },
    venta: {
        fontSize: normalize(16),
        color: gb.gray50,
        fontWeight: "bold"
    },
    contenidoDetalle: {
        backgroundColor: gb.gray50,
        padding: normalize(10),


    },
    contenidoProductos: {
        backgroundColor: gb.gray50,
        paddingHorizontal: normalize(20),
        flex: 1
    },
    modalContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    modalTitle: {
        fontSize: normalize(14),
        color: gb.gray400,
        marginBottom: normalize(20),
        textAlign: "center",

    },
    modalButton: {
        backgroundColor: gb.gray100,
        paddingHorizontal: normalize(20),
        paddingVertical: normalize(10),
        borderRadius: normalize(50),
        borderColor: gb.gray200,
        borderWidth: 1,
    },
    modalButtonText: {
        color: gb.gray500,
    },
    modalIconContainer: {
        width: normalize(80),
        height: normalize(80),
        borderRadius: normalize(40),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: normalize(20),
    }




})