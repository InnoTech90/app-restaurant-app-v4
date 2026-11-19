import { StyleSheet } from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { color, font, radius } from "../../../utils/theme";

const boton = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(8),
    minHeight: normalize(46),
    borderRadius: radius.md,
};

export const s = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: normalize(10),
        padding: normalize(12),
        backgroundColor: color.surface,
        borderTopWidth: 1,
        borderTopColor: color.border,
    },
    item: { flex: 1 },
    secundario: {
        ...boton,
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.borderStrong,
    },
    principal: { ...boton, backgroundColor: color.primary },
    secundarioTexto: { color: color.primaryDark, fontSize: font.sm, fontWeight: font.semibold },
    principalTexto: { color: color.textOnPrimary, fontSize: font.sm, fontWeight: font.semibold },
});
