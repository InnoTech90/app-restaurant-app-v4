import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
    /* ── Header ─────────────────────────────── */
    header: {
        width: "100%",
        height: normalize(50),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        color: "white",
        fontSize: normalize(18),
        fontWeight: "bold",
    },
    btnAdd: {
        width: normalize(35),
        height: normalize(35),
        borderRadius: normalize(15),
        backgroundColor: gb.gray50 + "20",
        borderWidth: normalize(1),
        borderColor: gb.gray50,
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
    },

    /* ── Body / lista ────────────────────────── */
    body: {
        flex: 1,
        backgroundColor: gb.gray100,
    },
    listContent: {
        padding: normalize(14),
        paddingBottom: normalize(30),
        gap: normalize(10),
        // En tablet: grid de 2 columnas centrado
        ...(isTablet && {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignSelf: "center",
            width: CONTENT_MAX_WIDTH,
        }),
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: normalize(60),
        gap: normalize(10),
    },
    emptyText: {
        color: gb.gray400,
        fontSize: normalize(14),
    },

    /* ── Card gasto ──────────────────────────── */
    card: {
        backgroundColor: "white",
        borderRadius: normalize(14),
        flexDirection: "row",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        // En tablet cada card ocupa ~48%
        ...(isTablet && { width: "48%" }),
    },
    cardAccent: {
        width: normalize(5),
    },
    cardBody: {
        flex: 1,
        padding: normalize(14),
        gap: normalize(5),
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardCategoria: {
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(14),
        flex: 1,
        marginRight: normalize(6),
    },
    cardMonto: {
        color: gb.green600,
        fontWeight: "800",
        fontSize: normalize(16),
    },
    cardConcepto: {
        color: gb.gray500,
        fontSize: normalize(12),
    },
    cardBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: normalize(2),
    },
    cardFecha: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    cardFechaText: {
        color: gb.gray400,
        fontSize: normalize(11),
    },
    cardDescripcion: {
        color: gb.gray400,
        fontSize: normalize(12),
        fontStyle: "italic",
    },

    /* ── Formulario (Agregar) ─────────────────── */
    formScroll: {
        padding: normalize(16),
        paddingBottom: normalize(40),
        gap: normalize(12),
    },
    sectionLabel: {
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(13),
        marginBottom: normalize(2),
        marginTop: normalize(8),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    saveBtn: {
        marginTop: normalize(8),
        borderRadius: normalize(12),
        overflow: "hidden",
    },
    saveBtnInner: {
        paddingVertical: normalize(14),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: normalize(8),
    },
    saveBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: normalize(15),
    },

    /* ── Detalle ─────────────────────────────── */
    detalleScroll: {
        padding: normalize(16),
        paddingBottom: normalize(40),
        gap: normalize(8),
    },
    detalleCard: {
        backgroundColor: "white",
        borderRadius: normalize(14),
        padding: normalize(16),
        gap: normalize(8),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    detalleTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detalleNombre: {
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(16),
        flex: 1,
        marginRight: normalize(6),
    },
    detalleDescripcion: {
        color: gb.gray500,
        fontSize: normalize(13),
    },
    /* lista de conceptos */
    conceptosList: {
        gap: normalize(8),
    },
    conceptoItem: {
        backgroundColor: "white",
        borderRadius: normalize(12),
        flexDirection: "row",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    conceptoAccent: {
        width: normalize(4),
    },
    conceptoBody: {
        flex: 1,
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(14),
        gap: normalize(3),
    },
    conceptoNombre: {
        color: gb.gray700,
        fontWeight: "600",
        fontSize: normalize(13),
    },
    conceptoDesc: {
        color: gb.gray400,
        fontSize: normalize(12),
        fontStyle: "italic",
    },
    conceptosEmpty: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: normalize(30),
        gap: normalize(8),
    },
    conceptosEmptyText: {
        color: gb.gray400,
        fontSize: normalize(13),
    },

    /* ── Banner total general ────────────────── */
    totalBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(10),
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: gb.gray200,
    },
    totalBannerLabel: {
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(14),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    totalBannerMonto: {
        color: gb.blue550,
        fontWeight: "800",
        fontSize: normalize(16),
    },

    /* ── Sección de categoría ────────────────── */
    seccion: {
        backgroundColor: "white",
        borderRadius: normalize(12),
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
        elevation: 3,
    },
    seccionHeader: {
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(9),
    },
    seccionNombre: {
        color: "white",
        fontWeight: "700",
        fontSize: normalize(13),
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    seccionVacia: {
        alignItems: "center",
        paddingVertical: normalize(14),
    },
    seccionVaciaText: {
        color: gb.gray400,
        fontSize: normalize(12),
        fontStyle: "italic",
    },
    seccionTotalRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: normalize(6),
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(8),
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
    },
    seccionTotalLabel: {
        color: gb.gray500,
        fontSize: normalize(12),
        fontWeight: "600",
        textTransform: "uppercase",
    },
    seccionTotalMonto: {
        color: gb.blue550,
        fontSize: normalize(14),
        fontWeight: "800",
    },

    /* ── Fila de concepto ────────────────────── */
    conceptoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(10),
    },
    conceptoRowInfo: {
        flex: 1,
        gap: normalize(2),
    },
    conceptoRowTopLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    conceptoRowNombre: {
        color: gb.gray700,
        fontWeight: "600",
        fontSize: normalize(13),
        flex: 1,
    },
    conceptoRowPrecioBase: {
        color: gb.gray400,
        fontSize: normalize(11),
    },
    conceptoRowMonto: {
        color: gb.blue550,
        fontWeight: "700",
        fontSize: normalize(14),
        marginLeft: normalize(8),
    },
    conceptoDivider: {
        height: 1,
        backgroundColor: gb.gray200,
        marginHorizontal: normalize(14),
    },

    /* ── Modal de registro ───────────────────── */
    modalOverlay: {
        flex: 1,
        backgroundColor: "#00000066",
        justifyContent: "center",
        alignItems: "center",
    },
    modalTapZone: {
        ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
        width: "85%",
        maxWidth: 360,
        backgroundColor: "white",
        borderRadius: normalize(16),
        overflow: "hidden",
        paddingBottom: normalize(18),
    },
    modalAccent: {
        height: normalize(5),
        width: "100%",
    },
    modalTitle: {
        textAlign: "center",
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(18),
        marginTop: normalize(14),
        paddingHorizontal: normalize(16),
    },
    modalFecha: {
        textAlign: "center",
        color: gb.gray400,
        fontSize: normalize(13),
        marginTop: normalize(4),
    },
    modalMontoWrap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: normalize(10),
        paddingHorizontal: normalize(30),
    },
    modalSigPeso: {
        color: gb.blue550,
        fontWeight: "700",
        fontSize: normalize(22),
        marginRight: normalize(4),
        marginBottom: normalize(2),
    },
    modalMontoInput: {
        flex: 1,
        color: gb.blue550,
        fontWeight: "700",
        fontSize: normalize(28),
        textAlign: "center",
        borderBottomWidth: 2,
        borderBottomColor: gb.blue550,
        paddingVertical: normalize(2),
    },
    modalLabel: {
        color: gb.gray600,
        fontWeight: "600",
        fontSize: normalize(12),
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginHorizontal: normalize(16),
        marginTop: normalize(6),
        marginBottom: normalize(4),
    },
    modalNotaInput: {
        marginHorizontal: normalize(16),
        borderWidth: 1,
        borderColor: gb.gray300,
        borderRadius: normalize(8),
        padding: normalize(10),
        fontSize: normalize(13),
        color: gb.gray700,
        minHeight: normalize(70),
        maxHeight: normalize(100),
    },
    modalHistorialWrap: {
        marginHorizontal: normalize(16),
        marginTop: normalize(8),
    },
    modalHistorialLabel: {
        color: gb.gray500,
        fontWeight: "600",
        fontSize: normalize(11),
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: normalize(4),
    },
    modalHistorialScroll: {
        maxHeight: normalize(100),
    },
    modalHistorialItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(5),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray200,
        gap: normalize(6),
    },
    modalHistorialFecha: {
        color: gb.gray500,
        fontSize: normalize(11),
    },
    modalHistorialNota: {
        color: gb.gray400,
        fontSize: normalize(11),
        fontStyle: "italic",
    },
    modalHistorialMonto: {
        color: gb.blue550,
        fontWeight: "700",
        fontSize: normalize(13),
    },
    modalButtons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: normalize(6),
        marginTop: normalize(16),
        paddingHorizontal: normalize(16),
    },
    modalBtnCancel: {
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(8),
    },
    modalBtnCancelText: {
        color: gb.red600,
        fontWeight: "700",
        fontSize: normalize(13),
    },
    modalBtnGuardar: {
        borderRadius: normalize(20),
        overflow: "hidden",
    },
    modalBtnGuardarInner: {
        paddingHorizontal: normalize(20),
        paddingVertical: normalize(9),
        alignItems: "center",
        justifyContent: "center",
    },
    modalBtnGuardarText: {
        color: "white",
        fontWeight: "700",
        fontSize: normalize(13),
    },

    /* ── Footer ──────────────────────────────── */
    footer: {
        width: "100%",
        height: normalize(50),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(8),
        gap: normalize(10),
        justifyContent: "space-around",
    },
    btnSync: {
        flexDirection: "row",
        flex: 1,
        borderWidth: normalize(1),
        borderColor: gb.gray50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: gb.gray50 + "20",
        borderRadius: normalize(15),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(0),
    },
    btnSyncText: {
        color: "white",
        fontWeight: "600",
        fontSize: normalize(14),
        marginLeft: normalize(6),
    },
});
