import { StyleSheet } from "react-native";
import { color, font, space } from "../../../utils/theme";
import { isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    header: {
        // el degradado lo pone LinearGradient; sombra para separarlo del contenido
        shadowColor: "#273568",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 2,
    },
    containerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: isTablet ? space.xl : space.lg,
        paddingBottom: space.md,
        minHeight: normalize(isTablet ? 64 : 56),
        gap: space.md,
    },
    titleBlock: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        color: "#FFFFFF",
        fontSize: font.lg,
        fontWeight: font.bold,
    },
    subtitle: {
        marginTop: 1,
        color: "rgba(255,255,255,0.85)",
        fontSize: font.xs,
    },
    rightActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        minWidth: normalize(isTablet ? 110 : 90),
        justifyContent: "flex-end",
    },
    ordersBadgeBtn: {
        minWidth: normalize(26),
        height: normalize(26),
        borderRadius: normalize(13),
        backgroundColor: color.danger,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: space.xs,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    ordersBadgeText: {
        color: color.textOnPrimary,
        fontSize: font.xs,
        fontWeight: font.bold,
    },
});
