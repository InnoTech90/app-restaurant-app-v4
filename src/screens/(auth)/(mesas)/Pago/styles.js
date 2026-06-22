import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, contentPaddingH, isTablet, normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

export const s = StyleSheet.create({
    // -- Root
    root: {
        flex: 1,
        backgroundColor: gb.gray50,
    },
    // -- Header
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
    // -- Scroll
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: isTablet ? contentPaddingH + normalize(12) : normalize(12),
        paddingTop: normalize(12),
        paddingBottom: normalize(120),
        gap: normalize(12),
        // En tablet limitar el ancho del contenido
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    // -- Footer fijo
    footer: {
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: gb.gray50,
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
        paddingTop: normalize(10),
        paddingBottom: normalize(14),
        elevation: 10,
    },
    btnImprimirContainer: {
        borderRadius: normalize(10),
        overflow: "hidden",
    },
    footerRow: {
        flexDirection: "row",
        gap: normalize(8),
    },
    btnImprimir: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(14),
        gap: normalize(8),
    },
    btnImprimirTexto: {
        fontSize: normalize(15),
        fontWeight: "700",
        color: gb.gray50,
    },
    // ── Modal de clientes ───────────────────────────────────────────────────
    modalBuscador: {
        paddingVertical: normalize(10),
    },
    modalClienteItem: {
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    modalClienteBoton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(12),
        gap: normalize(12),
        backgroundColor: "transparent",
        borderRadius: 0,
    },
    modalClienteAvatar: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        backgroundColor: gb.blue200,
        alignItems: "center",
        justifyContent: "center",
    },
    modalClienteAvatarText: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: gb.blue550,
    },
    modalClienteNombre: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: gb.gray800,
    },
    modalClienteTelefono: {
        fontSize: normalize(12),
        color: gb.gray400,
        marginTop: normalize(2),
    },
    modalVacio: {
        textAlign: "center",
        marginTop: normalize(40),
        fontSize: normalize(14),
        color: gb.gray400,
    },
});
