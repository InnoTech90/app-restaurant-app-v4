import { StyleSheet } from "react-native";
import { color, font, radius, space } from "../../../utils/theme";

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
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    headerModerno: {
        backgroundColor: "transparent",
        paddingHorizontal: space.lg,
        paddingTop: space.md,
        paddingBottom: space.sm,
    },
    title: {
        fontSize: font.sm,
    },
    titleModerno: {
        fontSize: font.sm,
        fontWeight: font.semibold,
        color: color.textMuted,
        letterSpacing: 0.2,
        textTransform: "none",
    },
    description: {
        fontSize: font.sm,
        color: color.textSecondary,
    },
});
