import { StyleSheet } from "react-native";
import { color, font, radius, space } from "../../../utils/theme";
import { CONTENT_MAX_WIDTH, isTablet, normalize, wp } from "../../../utils/funcionesMaquetado/responsiveWH";

// Mesa cuadrada con sillas (diseño original): 2 columnas en teléfono y
// en tablet (con 3 se veían muy chicas en tablet); el tamaño sale del ancho
// disponible para que siempre quepan.
const COLUMNAS = 2;
const GAP = normalize(isTablet ? 14 : 10);
const ANCHO_UTIL = Math.min(wp(100), CONTENT_MAX_WIDTH) - normalize(isTablet ? 48 : 32);
const CELDA = Math.floor((ANCHO_UTIL - GAP * (COLUMNAS - 1)) / COLUMNAS) - 1;
const SILLA_OFFSET = normalize(isTablet ? 8 : 7);
const SILLA_GRUESO = normalize(isTablet ? 7 : 6);
// Ocupa toda la celda (antes se limitaba y en tablet quedaba chica).
const MESA_SIZE = CELDA - SILLA_OFFSET * 2;
const SILLA_LARGO = Math.round(MESA_SIZE * 0.6);

export const s = StyleSheet.create({
    mesaContainer: {
        width: CELDA,
        paddingVertical: SILLA_OFFSET,
        justifyContent: "center",
        alignItems: "center",
    },
    // Cuadrada como mínimo; si el contenido (folio, "Cuenta impresa", nota)
    // no cabe, crece hacia abajo en vez de encimarse con las sillas.
    mesa: {
        width: MESA_SIZE,
        minHeight: MESA_SIZE,
        paddingVertical: space.lg,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color.surface,
    },
    sillaLeft: { position: "absolute", left: -SILLA_OFFSET, width: SILLA_GRUESO, height: SILLA_LARGO, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, backgroundColor: color.borderStrong },
    sillaRight: { position: "absolute", right: -SILLA_OFFSET, width: SILLA_GRUESO, height: SILLA_LARGO, borderTopRightRadius: 5, borderBottomRightRadius: 5, backgroundColor: color.borderStrong },
    sillaTop: { position: "absolute", top: -SILLA_OFFSET, width: SILLA_LARGO, height: SILLA_GRUESO, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: color.borderStrong },
    sillaBottom: { position: "absolute", bottom: -SILLA_OFFSET, width: SILLA_LARGO, height: SILLA_GRUESO, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: color.borderStrong },
    sillaOcupada: { backgroundColor: color.primary },
    sillaImpresa: { backgroundColor: color.warning },
    filaAcciones: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
        marginTop: space.sm,
        gap: space.xs,
    },
    mesaOcupada: {
        borderColor: color.primary,
        backgroundColor: color.primarySoft,
    },
    mesaImpresa: {
        borderColor: color.warning,
        backgroundColor: color.warningSoft,
    },
    // contenido
    contenido: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: space.sm,
    },
    nombre: {
        fontSize: font.md,
        fontWeight: font.bold,
        color: color.title,
        textAlign: "center",
    },
    estadoOcupada: {
        fontSize: font.xs,
        fontWeight: font.bold,
        color: color.primaryDark,
        marginTop: space.xs,
    },
    estadoImpresa: {
        marginTop: space.xs,
        fontSize: font.xs,
        fontWeight: font.bold,
        color: color.warning,
    },
    estadoLibre: {
        marginTop: space.sm,
        fontSize: font.xs,
        fontWeight: font.semibold,
        color: color.success,
        backgroundColor: color.successSoft,
        paddingHorizontal: space.md,
        paddingVertical: 3,
        borderRadius: radius.pill,
        overflow: "hidden",
    },
    ficha: {
        fontSize: font.xs,
        color: color.textSecondary,
        marginTop: 2,
    },
    notaInput: {
        flex: 1,
        height: normalize(32),
        borderWidth: 1,
        borderColor: color.borderStrong,
        borderRadius: radius.sm,
        paddingHorizontal: space.sm,
        paddingVertical: 0,
        fontSize: font.xs,
        color: color.text,
        backgroundColor: color.surface,
        textAlign: "center",
    },
    cambiarMesa: {
        backgroundColor: color.primary,
        borderRadius: radius.pill,
        width: normalize(32),
        height: normalize(32),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: space.xs,
    },
    cambiarMesaTexto: {
        color: color.textOnPrimary,
        fontSize: font.xs,
        fontWeight: font.bold,
    },
    instrucciones: {
        fontSize: font.sm,
        color: color.textSecondary,
        marginBottom: space.sm,
        textAlign: "center",
    },
    contenedorFichaActual: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: space.sm,
        minHeight: normalize(42),
        backgroundColor: color.primarySoft,
        borderRadius: radius.md,
        flexDirection: "row",
    },
    mesaActualFolio: {
        color: color.title,
        fontSize: font.sm,
        fontWeight: font.bold,
    },
    listaMesas: {
        width: "100%",
        marginTop: space.lg,
        flexDirection: isTablet ? "row" : "column",
        flexWrap: isTablet ? "wrap" : "nowrap",
        gap: space.sm,
    },
    mesaItemContenedor: {
        width: isTablet ? undefined : "100%",
    },
    mesaItem: {
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.borderStrong,
        minWidth: isTablet ? normalize(150) : undefined,
    },
    textoMesa: {
        fontSize: font.md,
        color: color.title,
        fontWeight: font.semibold,
    },
    noDataContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    textoMesaDescripcion: {
        fontSize: font.sm,
        color: color.textMuted,
        marginBottom: space.lg,
    },
    cerrarButton: {
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.borderStrong,
        width: normalize(200),
        marginBottom: space.lg,
    },
});
