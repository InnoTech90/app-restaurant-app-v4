import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

export const s = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black',
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
        fontSize: normalize(20),
        fontWeight: "800",
        color: gb.gray50,
        letterSpacing: 0.3,
    },
    headerSubtitulo: {
        fontSize: normalize(13),
        color: gb.blue200,
    },
    // ── Scroll ──────────────────────────────────────────────
    scroll: {
        flex: 1,
        backgroundColor: gb.gray50,
    },
    scrollContent: {
        paddingHorizontal: normalize(16),
        paddingTop: normalize(16),
        paddingBottom: normalize(110),
        gap: normalize(14),
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    // ── Sección grupo ───────────────────────────────────────
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
    // ── Fila de complemento ─────────────────────────────────
    complementoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray200,
    },
    complementoRowUltimo: {
        borderBottomWidth: 0,
    },
    complementoInfo: {
        flex: 1,
        marginRight: normalize(12),
    },
    complementoNombre: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: gb.gray800,
    },
    complementoPrecio: {
        fontSize: normalize(12),
        color: gb.green600,
        fontWeight: "600",
        marginTop: normalize(2),
    },
    inputCantidad: {
        width: normalize(130),
    },
    // ── Footer fijo ─────────────────────────────────────────
    footer: {

        padding: normalize(16),
        backgroundColor: gb.gray50,
        borderTopWidth: 1,
        borderColor: gb.gray200,
    },
    botonAnadir: {
        borderRadius: normalize(12),
    },
    botonAnadirTexto: {
        fontSize: normalize(16),
        fontWeight: "800",
        color: gb.gray50,
        letterSpacing: 0.5,
        paddingVertical: normalize(14),
        textAlign: "center",
    },
});