import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

export const s = StyleSheet.create({
    safeArea: {
        // flex: 1,
        backgroundColor: gb.gray100,
    },
    // ── Header ──────────────────────────────────────────────
    header: {
        width: "100%",
        height: normalize(50),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerNombre: {
        fontSize: normalize(22),
        fontWeight: "800",
        color: gb.gray50,
        letterSpacing: 0.3,
    },
    headerPrecioBase: {
        fontSize: normalize(14),
        color: gb.blue200,
        marginTop: normalize(2),
    },
    // ── Scroll contenido ────────────────────────────────────
    scroll: {
        flex: 1,
        backgroundColor: gb.gray50,
    },
    scrollContent: {
        paddingHorizontal: normalize(16),
        paddingTop: normalize(16),
        paddingBottom: normalize(120),
        gap: normalize(14),
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    // ── Sección genérica ────────────────────────────────────
    seccion: {
        backgroundColor: gb.gray50,
        borderRadius: normalize(12),
        padding: normalize(16),
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: normalize(4),
        shadowOffset: { width: 0, height: normalize(2) },
        elevation: 2,
    },
    seccionTitulo: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: gb.gray400,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: normalize(10),
    },
    // ── Notas ───────────────────────────────────────────────
    textArea: {
        minHeight: normalize(80),
        borderWidth: 1,
        borderColor: gb.blue100,
        borderRadius: normalize(8),
        backgroundColor: gb.gray100,
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(10),
        fontSize: normalize(14),
        color: gb.gray800,
        textAlignVertical: "top",
    },
    // ── Botón complementos ──────────────────────────────────
    botonComplementos: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(8),
        borderWidth: 1.5,
        borderColor: gb.blue550,
        borderRadius: normalize(10),
        paddingVertical: normalize(12),
        backgroundColor: gb.blue50,
    },
    botonComplementosTexto: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: gb.blue550,
    },
    // ── Cantidad ────────────────────────────────────────────
    cantidadRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cantidadLabel: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: gb.gray700,
    },
    inputCantidad: {
        width: normalize(160),
    },
    // ── Descuento ───────────────────────────────────────────
    descuentoRow: {
        flexDirection: "row",
        gap: normalize(12),
    },
    descuentoItem: {
        flex: 1,
    },
    descuentoLabel: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: gb.gray500,
        marginBottom: normalize(6),
    },
    descuentoInput: {
        height: normalize(46),
        borderWidth: 1,
        borderColor: gb.blue100,
        borderRadius: normalize(8),
        backgroundColor: gb.gray100,
        paddingHorizontal: normalize(12),
        fontSize: normalize(15),
        color: gb.gray800,
        textAlign: "center",
    },
    // ── Total ───────────────────────────────────────────────
    totalRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: normalize(6),
    },
    totalLabel: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: gb.gray700,
    },
    totalValor: {
        fontSize: normalize(28),
        fontWeight: "800",
        color: gb.green500,
    },
    // ── Resumen desglose ──────────────────────────────────
    resumenFila: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: normalize(5),
    },
    resumenTextoIzq: {
        flex: 1,
        fontSize: normalize(13),
        color: gb.gray600,
        marginRight: normalize(8),
    },
    resumenTextoDer: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.gray700,
    },
    resumenDivider: {
        height: 1,
        backgroundColor: gb.gray200,
        marginVertical: normalize(8),
    },
    // ── Footer fijo ─────────────────────────────────────────
    footer: {
      
        padding: normalize(16),
        backgroundColor: gb.gray50,
        borderTopWidth: 1,
        borderColor: gb.gray200,
    },
    botonAgregar: {
        borderRadius: normalize(12),
        paddingVertical: normalize(14),
        alignItems: "center",
        justifyContent: "center",
    },
    botonAgregarTexto: {
        fontSize: normalize(16),
        fontWeight: "800",
        color: gb.gray50,
        letterSpacing: 0.5,
    },
});

  