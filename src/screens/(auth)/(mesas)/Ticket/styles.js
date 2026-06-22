import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, contentPaddingH, isTablet, normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

// export const s = StyleSheet.create({
//     root: {
//         flex: 1,
//         backgroundColor: gb.gray100,
//     },
//     // ── Header ──────────────────────────────────────────────────────────────
//     header: {
//         width: "100%",
//         height: normalize(60),
//         paddingHorizontal: normalize(10),
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//     },
//     headerCenter: {
//         flex: 1,
//         alignItems: "center",
//     },
//     headerMesa: {
//         fontSize: normalize(16),
//         fontWeight: "800",
//         color: gb.gray50,
//     },
//     headerSub: {
//         fontSize: normalize(11),
//         color: gb.blue100,
//         marginTop: normalize(2),
//     },
//     btnCancelarContainer: {
//         borderRadius: normalize(20),
//         overflow: "hidden",
//     },
//     btnCancelar: {
//         width: normalize(40),
//         height: normalize(40),
//         backgroundColor: gb.red600 + "CC",
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     // ── Cliente strip ────────────────────────────────────────────────────────
//     clienteStrip: {
//         flexDirection: "row",
//         alignItems: "center",
//         gap: normalize(6),
//         backgroundColor: gb.green50,
//         borderBottomWidth: 1,
//         borderBottomColor: gb.green200,
//         paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
//         paddingVertical: normalize(8),
//     },
//     clienteNombre: {
//         fontSize: normalize(13),
//         fontWeight: "600",
//         color: gb.green700,
//         flex: 1,
//     },
//     clienteTelefono: {
//         fontSize: normalize(12),
//         color: gb.green600,
//     },
//     // ── Lista artículos ───────────────────────────────────────────────────────
//     lista: {
//         flex: 1,
//     },
//     listaContent: {
//         paddingBottom: normalize(20),
//         ...(isTablet && { paddingHorizontal: contentPaddingH }),
//     },
//     listaHeader: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: isTablet ? contentPaddingH + normalize(22) : normalize(22),
//         paddingVertical: normalize(8),
//         backgroundColor: gb.blue550 + "14",
//         borderBottomWidth: 1,
//         borderBottomColor: gb.blue550 + "30",
//         gap: normalize(8),
//     },
//     listaHeaderTexto: {
//         fontSize: normalize(11),
//         fontWeight: "700",
//         color: gb.gray400,
//         textTransform: "uppercase",
//         flex: 1,
//     },
//     articuloRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         backgroundColor: gb.gray50,
//         marginHorizontal: isTablet ? contentPaddingH + normalize(10) : normalize(10),
//         marginTop: normalize(8),
//         borderRadius: normalize(10),
//         paddingHorizontal: normalize(12),
//         paddingVertical: normalize(10),
//         gap: normalize(8),
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.08,
//         shadowRadius: 4,
//     },
//     articuloRowBorder: {},
//     articuloInfo: {
//         flex: 1,
//     },
//     articuloNombre: {
//         fontSize: normalize(13),
//         fontWeight: "600",
//         color: gb.gray800,
//     },
//     articuloMeta: {
//         flexDirection: "row",
//         gap: normalize(4),
//         marginTop: normalize(2),
//     },
//     articuloPrecio: {
//         fontSize: normalize(11),
//         color: gb.gray400,
//     },
//     articuloComps: {
//         fontSize: normalize(11),
//         color: gb.purple550,
//     },
//     inputCantidad: {
//         width: normalize(110),
//     },
//     articuloTotal: {
//         fontSize: normalize(13),
//         fontWeight: "700",
//         color: gb.blue550,
//         minWidth: normalize(52),
//         textAlign: "right",
//     },
//     btnEliminarContainer: {
//         borderRadius: normalize(18),
//         overflow: "hidden",
//     },
//     btnEliminar: {
//         width: normalize(34),
//         height: normalize(34),
//         backgroundColor: gb.red50,
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     vacio: {
//         textAlign: "center",
//         paddingVertical: normalize(40),
//         fontSize: normalize(13),
//         color: gb.gray400,
//     },
//     // ── Footer fijo ───────────────────────────────────────────────────────────
//     footer: {
//         backgroundColor: gb.gray50,
//         borderTopWidth: 1,
//         borderTopColor: gb.gray200,
//         paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
//         paddingTop: normalize(10),
//         paddingBottom: normalize(12),
//         gap: normalize(10),
//         elevation: 8,
//     },
//     notasInput: {
//         backgroundColor: gb.gray100,
//         borderRadius: normalize(8),
//         paddingHorizontal: normalize(12),
//         paddingVertical: normalize(8),
//         fontSize: normalize(13),
//         color: gb.gray800,
//         maxHeight: normalize(60),
//         borderWidth: 1,
//         borderColor: gb.gray200,
//     },
//     totalesRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//     },
//     totalProductos: {
//         fontSize: normalize(13),
//         color: gb.gray400,
//     },
//     totalGrande: {
//         fontSize: normalize(24),
//         fontWeight: "800",
//         color: gb.green500,
//     },
//     btnImprimirContainer: {
//         borderRadius: normalize(10),
//         overflow: "hidden",
//     },
//     btnImprimir: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "center",
//         paddingVertical: normalize(12),
//         gap: normalize(8),
//     },
//     btnImprimirTexto: {
//         fontSize: normalize(15),
//         fontWeight: "700",
//         color: gb.gray50,
//     },
// })

export const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: gb.gray100,
    },
    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        width: "100%",
        height: normalize(60),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerMesa: {
        fontSize: normalize(16),
        fontWeight: "800",
        color: gb.gray50,
    },
    headerSub: {
        fontSize: normalize(11),
        color: gb.blue100,
        marginTop: normalize(2),
    },
    btnCancelarContainer: {
        borderRadius: normalize(20),
        overflow: "hidden",
    },
    btnCancelar: {
        width: normalize(40),
        height: normalize(40),
        backgroundColor: gb.red600 + "CC",
        alignItems: "center",
        justifyContent: "center",
    },
    // ── Cliente strip ────────────────────────────────────────────────────────
    clienteStrip: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
        backgroundColor: gb.green50,
        borderBottomWidth: 1,
        borderBottomColor: gb.green200,
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(8),
    },
    clienteNombre: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.green700,
        flex: 1,
    },
    clienteTelefono: {
        fontSize: normalize(12),
        color: gb.green600,
    },
    // ── Lista artículos ───────────────────────────────────────────────────────
    lista: {
        flex: 1,
    },
    listaContent: {
        paddingBottom: normalize(20),
    },
    listaHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(22),
        paddingVertical: normalize(8),
        backgroundColor: gb.blue550 + "14",
        borderBottomWidth: 1,
        borderBottomColor: gb.blue550 + "30",
        gap: normalize(8),
    },
    listaHeaderTexto: {
        fontSize: normalize(11),
        fontWeight: "700",
        color: gb.gray400,
        textTransform: "uppercase",
        flex: 1,
    },
    articuloRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: gb.gray50,
        marginHorizontal: normalize(10),
        marginTop: normalize(8),
        borderRadius: normalize(10),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(10),
        gap: normalize(8),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        // borderLeftWidth: normalize(3),
        // borderLeftColor: gb.blue550,
    },
    articuloRowBorder: {},
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
        width: normalize(110),
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
    vacio: {
        textAlign: "center",
        paddingVertical: normalize(40),
        fontSize: normalize(13),
        color: gb.gray400,
    },
    // ── Footer fijo ───────────────────────────────────────────────────────────
    footer: {
        backgroundColor: gb.gray50,
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        paddingHorizontal: normalize(16),
        paddingTop: normalize(10),
        paddingBottom: normalize(12),
        gap: normalize(10),
        elevation: 8,
    },
    notasInput: {
        backgroundColor: gb.gray100,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(8),
        fontSize: normalize(13),
        color: gb.gray800,
        maxHeight: normalize(60),
        borderWidth: 1,
        borderColor: gb.gray200,
    },
    totalesRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    totalProductos: {
        fontSize: normalize(13),
        color: gb.gray400,
    },
    totalGrande: {
        fontSize: normalize(24),
        fontWeight: "800",
        color: gb.green500,
    },
    btnImprimirContainer: {
        borderRadius: normalize(10),
        overflow: "hidden",
    },
    btnImprimir: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(12),
        gap: normalize(8),
    },
    btnImprimirTexto: {
        fontSize: normalize(15),
        fontWeight: "700",
        color: gb.gray50,
    },
})


