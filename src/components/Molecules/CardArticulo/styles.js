import { StyleSheet } from "react-native";
import { color, font, space, touch } from "../../../utils/theme";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    contenedor: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: touch + 10,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        borderTopWidth: 1,
        borderColor: color.border,
        backgroundColor: color.surface,
    },
    info: {
        flex: 1,
        marginRight: space.md,
    },
    nombre: {
        fontSize: font.md,
        fontWeight: font.semibold,
        color: color.text,
    },
    nombreCorto: {
        fontSize: font.xs,
        color: color.textMuted,
        marginTop: 2,
    },
    precio: {
        fontSize: font.md,
        fontWeight: font.bold,
        color: color.primaryDark,
        marginRight: space.sm,
    },
    agregar: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: normalize(10),
        backgroundColor: color.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    presionado: { backgroundColor: color.primarySoft },
});
