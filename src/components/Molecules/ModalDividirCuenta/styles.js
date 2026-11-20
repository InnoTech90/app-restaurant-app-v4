import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

import { color as tema } from "../../../utils/theme";
export const s = StyleSheet.create({
    // ── Overlay / Sheet ────────────────────────────────────────────────────
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
    },
    sheet: {
        backgroundColor: gb.gray100,
        borderTopLeftRadius: normalize(16),
        borderTopRightRadius: normalize(16),
        overflow: "hidden",
    },
    // ── Header ─────────────────────────────────────────────────────────────
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(14),
        backgroundColor: tema.surface,
        borderBottomWidth: 1,
        borderBottomColor: tema.border,
    },
    headerTitulo: {
        fontSize: normalize(17),
        fontWeight: "700",
        color: tema.title,
    },
    headerClose: {
        padding: normalize(4),
    },
    // ── Scroll ─────────────────────────────────────────────────────────────
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: normalize(12),
        gap: normalize(10),
    },
    // ── Total box ──────────────────────────────────────────────────────────
    totalBox: {
        backgroundColor: gb.blue550,
        borderRadius: normalize(12),
        paddingVertical: normalize(14),
        paddingHorizontal: normalize(16),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    totalLabel: {
        fontSize: normalize(13),
        color: gb.blue100,
        fontWeight: "600",
    },
    totalValor: {
        fontSize: normalize(22),
        fontWeight: "800",
        color: "#FFFFFF",
    },
    // ── Card genérica ──────────────────────────────────────────────────────
    card: {
        backgroundColor: gb.gray50,
        borderRadius: normalize(12),
        overflow: "hidden",
        borderWidth: 1,
        borderColor: gb.gray200,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    cardHeaderTitulo: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray800,
    },
    // ── Config clientes ────────────────────────────────────────────────────
    configRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(10),
    },
    configLabel: {
        fontSize: normalize(13),
        color: gb.gray700,
    },
    counter: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    counterBtn: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(8),
        backgroundColor: gb.gray100,
        alignItems: "center",
        justifyContent: "center",
    },
    counterValor: {
        fontSize: normalize(15),
        fontWeight: "700",
        color: gb.gray800,
        minWidth: normalize(28),
        textAlign: "center",
    },
    btnDividirIgualContainer: {
        marginHorizontal: normalize(14),
        marginBottom: normalize(12),
        borderRadius: normalize(8),
        overflow: "hidden",
    },
    btnDividirIgual: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(6),
        paddingVertical: normalize(10),
    },
    btnDividirIgualTexto: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    // ── Lista pagos ─────────────────────────────────────────────────────────
    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    listHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    colHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(6),
        backgroundColor: gb.gray100,
        gap: normalize(6),
    },
    colTexto: {
        fontSize: normalize(11),
        color: gb.gray400,
        fontWeight: "600",
    },
    // ── Fila por cliente ───────────────────────────────────────────────────
    filaBloque: {
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(14),
        paddingTop: normalize(10),
        paddingBottom: normalize(6),
        gap: normalize(6),
    },
    // Segunda línea de cada cliente: "Paga con" y el cambio.
    filaRecibido: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8),
        paddingLeft: normalize(14 + 24 + 6 + 24 + 6),
        paddingRight: normalize(14),
        paddingBottom: normalize(10),
    },
    recibidoLabel: {
        fontSize: normalize(12),
        color: gb.gray500,
    },
    recibidoWrap: {
        width: normalize(110),
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: gb.gray200,
        borderRadius: normalize(7),
        paddingHorizontal: normalize(8),
        backgroundColor: gb.gray50,
        height: normalize(32),
        gap: normalize(4),
    },
    recibidoInput: {
        flex: 1,
        fontSize: normalize(13),
        color: gb.gray800,
        padding: 0,
    },
    cambioTexto: {
        flex: 1,
        textAlign: "right",
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.green600,
    },
    faltaTexto: {
        flex: 1,
        textAlign: "right",
        fontSize: normalize(12),
        fontWeight: "600",
        color: gb.red600,
    },
    recibidoAyuda: {
        flex: 1,
        textAlign: "right",
        fontSize: normalize(12),
        color: gb.gray400,
    },
    resumenCambio: {
        fontSize: normalize(11),
        fontWeight: "700",
        color: gb.green600,
        marginTop: normalize(2),
    },
    filaPagada: {
        backgroundColor: gb.green50,
    },
    filaNum: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(12),
        backgroundColor: gb.blue550 + "1A",
        alignItems: "center",
        justifyContent: "center",
    },
    filaNumTexto: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: gb.blue550,
    },
    check: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(6),
        borderWidth: 2,
        borderColor: gb.red600,
        alignItems: "center",
        justifyContent: "center",
    },
    checkActivo: {
        backgroundColor: gb.green500,
        borderColor: gb.green500,
    },
    checkDisabled: {
        borderColor: gb.gray300,
        opacity: 0.45,
    },
    montoWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: gb.gray200,
        borderRadius: normalize(7),
        paddingHorizontal: normalize(8),
        backgroundColor: gb.gray50,
        height: normalize(36),
    },
    montoSimbolo: {
        fontSize: normalize(13),
        color: gb.gray600,
        marginRight: normalize(2),
    },
    montoInput: {
        flex: 1,
        fontSize: normalize(13),
        color: gb.gray800,
        padding: 0,
    },
    selectWrap: {
        flex: 1.4,
    },
    selectInline: {
        width: "100%",
    },
    // ── Resumen ───────────────────────────────────────────────────────────
    resumenFila: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(10),
    },
    resumenFilaBorde: {
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    resumenFilaLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8),
    },
    resumenDot: {
        width: normalize(8),
        height: normalize(8),
        borderRadius: normalize(4),
    },
    resumenNombre: {
        fontSize: normalize(13),
        color: gb.gray700,
        fontWeight: "600",
    },
    resumenFilaRight: {
        alignItems: "flex-end",
    },
    resumenMonto: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray800,
    },
    resumenMetodo: {
        fontSize: normalize(11),
        color: gb.gray400,
        marginTop: normalize(2),
    },
    resumenTotal: {
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(10),
        gap: normalize(4),
    },
    resumenTotalFila: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    resumenTotalLabel: {
        fontSize: normalize(12),
        color: gb.gray500,
        fontWeight: "600",
    },
    resumenTotalValor: {
        fontSize: normalize(13),
        fontWeight: "800",
    },
    // ── Footer botones ────────────────────────────────────────────────────
    footerBtns: {
        flexDirection: "row",
        gap: normalize(10),
        padding: normalize(12),
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        backgroundColor: gb.gray50,
    },
    btnCancelarContainer: {
        flex: 1,
        borderRadius: normalize(10),
        borderWidth: 1,
        borderColor: gb.gray300,
        overflow: "hidden",
    },
    btnCancelar: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(12),
        backgroundColor: "transparent",
    },
    btnCancelarTexto: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: gb.gray700,
    },
    btnGuardarContainer: {
        flex: 2,
        borderRadius: normalize(10),
        overflow: "hidden",
    },
    btnGuardar: {
        flexDirection: "row",
        backgroundColor: gb.blue550,
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(6),
        paddingVertical: normalize(12),
    },
    btnGuardarDisabled: {
        backgroundColor: gb.gray300,
    },
    btnGuardarTexto: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
