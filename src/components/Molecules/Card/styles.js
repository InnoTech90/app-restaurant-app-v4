import { StyleSheet } from "react-native";
import { color, font, radius, shadow, space } from "../../../utils/theme";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    container: {
        width: "90%",
        padding: space.lg,
        backgroundColor: color.surface,
    },
    // Se aplican al final para que el estilo moderno gane sobre los que mandan
    // las pantallas (radios de "tapa" de la versión con degradado).
    containerModerno: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: color.border,
        overflow: "hidden",
        ...shadow.card,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    // Encabezado: ícono en cuadro suave + título fuerte + línea divisoria.
    headerModerno: {
        justifyContent: "flex-start",
        gap: space.sm,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        marginBottom: space.xs,
    },
    icono: {
        width: normalize(30),
        height: normalize(30),
        borderRadius: radius.sm,
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: font.sm,
    },
    titleModerno: {
        flex: 1,
        fontSize: font.md,
        fontWeight: font.bold,
        color: "#FFFFFF",
        letterSpacing: 0.2,
        textTransform: "none",
    },
    description: {
        fontSize: font.sm,
        color: color.textSecondary,
    },
});
