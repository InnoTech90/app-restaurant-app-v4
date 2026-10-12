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
    filtrosPeriodo: {
        backgroundColor: "white",
        width: "100%",
        height: normalize(48),
        paddingHorizontal: normalize(10),
        paddingTop: normalize(8),
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        gap: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
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
    leyendaColores: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: normalize(14),
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(8),
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: gb.gray200,
        width: "100%",
    },
    leyendaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    leyendaMuestra: {
        width: normalize(14),
        height: normalize(14),
        borderRadius: normalize(4),
    },
    leyendaTexto: {
        color: gb.gray600,
        fontSize: normalize(12),
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
    scrollDetalle: {
        flex: 1,
        backgroundColor: gb.gray50,
    },
    scrollDetalleContent: {
        flexGrow: 1,
        paddingBottom: normalize(20),
    },
    contenidoDetalle: {
        backgroundColor: gb.gray50,
        padding: normalize(12),
        gap: normalize(12),
    },
    contenidoProductos: {
        backgroundColor: gb.gray50,
        paddingHorizontal: normalize(12),
        paddingTop: normalize(4),
    },
    bloqueTituloProductos: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray700,
        marginBottom: normalize(10),
        paddingHorizontal: normalize(4),
    },
    bloqueInfo: {
        backgroundColor: "white",
        borderRadius: normalize(12),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(12),
        gap: normalize(10),
        borderWidth: 1,
        borderColor: gb.gray200,
    },
    bloqueTitulo: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray700,
        marginBottom: normalize(2),
    },
    datoFila: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10),
    },
    datoIcono: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: normalize(10),
        backgroundColor: gb.gray100,
        alignItems: "center",
        justifyContent: "center",
    },
    datoIconoDestacado: {
        backgroundColor: gb.blue100,
    },
    datoTextos: {
        flex: 1,
        gap: normalize(1),
    },
    datoEtiqueta: {
        fontSize: normalize(11),
        color: gb.gray400,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    datoValor: {
        fontSize: normalize(14),
        color: gb.gray800,
        fontWeight: "600",
    },
    datoValorDestacado: {
        color: gb.blue550,
    },
    filaDesglose: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filaDesgloseLabel: {
        fontSize: normalize(13),
        color: gb.gray500,
    },
    filaDesgloseValor: {
        fontSize: normalize(13),
        color: gb.gray700,
        fontWeight: "500",
    },
    filaDesgloseBold: {
        fontWeight: "700",
        color: gb.gray800,
        fontSize: normalize(15),
    },
    filaDesgloseResta: {
        color: "#F44336",
    },
    totalSeparador: {
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        paddingTop: normalize(8),
        marginTop: normalize(2),
    },
    cuentaDivididaBox: {
        backgroundColor: "white",
        borderRadius: normalize(12),
        padding: normalize(12),
        gap: normalize(10),
        borderWidth: 1,
        borderColor: gb.blue100,
    },
    cuentaDivididaHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cuentaDivididaHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10),
    },
    cuentaDivididaIconWrap: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: gb.blue100,
        alignItems: "center",
        justifyContent: "center",
    },
    cuentaDivididaTitulo: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: gb.gray800,
    },
    cuentaDivididaSubtitulo: {
        fontSize: normalize(12),
        color: gb.gray500,
        marginTop: normalize(1),
    },
    cuentaDivididaCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10),
        backgroundColor: gb.gray50,
        borderRadius: normalize(10),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(10),
        borderWidth: 1,
        borderColor: gb.gray200,
    },
    cuentaDivididaBadge: {
        width: normalize(28),
        height: normalize(28),
        borderRadius: normalize(14),
        backgroundColor: gb.blue550,
        alignItems: "center",
        justifyContent: "center",
    },
    cuentaDivididaBadgeText: {
        color: "white",
        fontSize: normalize(13),
        fontWeight: "700",
    },
    cuentaDivididaCardBody: {
        flex: 1,
        gap: normalize(4),
    },
    cuentaDivididaCliente: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray800,
    },
    cuentaDivididaMetodoPill: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
        backgroundColor: gb.blue100,
        borderRadius: normalize(20),
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(3),
    },
    cuentaDivididaMetodo: {
        fontSize: normalize(11),
        color: gb.blue550,
        fontWeight: "600",
    },
    cuentaDivididaMonto: {
        fontSize: normalize(15),
        fontWeight: "800",
        color: gb.gray800,
    },
    footerReimprimir: {
        backgroundColor: gb.gray50,
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        paddingHorizontal: normalize(16),
        paddingTop: normalize(10),
        paddingBottom: normalize(14),
    },
    btnReimprimirContainer: {
        borderRadius: normalize(10),
        overflow: "hidden",
    },
    btnReimprimir: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(14),
        gap: normalize(8),
    },
    btnReimprimirTexto: {
        fontSize: normalize(15),
        fontWeight: "700",
        color: gb.gray50,
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