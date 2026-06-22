import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, contentPaddingH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
    /* ── Contenedor raíz ─────────────────────── */
    root: {
        flex: 1,
        backgroundColor: 'black',
    },

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

    /* ── Banner contador ─────────────────────── */
    bannerContainer: {
        marginHorizontal: normalize(14),
        marginTop: normalize(14),
        marginBottom: normalize(6),
        borderRadius: normalize(14),
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    banner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(18),
        paddingVertical: normalize(14),
    },
    bannerLabel: {
        color: "white",
        fontSize: normalize(13),
        opacity: 0.9,
    },
    bannerCount: {
        color: "white",
        fontSize: normalize(32),
        fontWeight: "bold",
        lineHeight: normalize(36),
    },
    bannerIcon: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: normalize(30),
        padding: normalize(10),
    },

    /* ── Lista ───────────────────────────────── */
    listContent: {
        padding: normalize(14),
        paddingBottom: normalize(30),
        gap: normalize(10),
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },

    /* ── Estados vacío / error ───────────────── */
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

    /* ── Footer ───────────────────────────── */
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(10),
    },
    footerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8),
        paddingHorizontal: normalize(20),
        paddingVertical: normalize(10),
        borderRadius: normalize(20),
        backgroundColor: gb.gray50 + "40",
    },
    footerBtnText: {
        color: gb.gray50,
        fontSize: normalize(14),
        fontWeight: "bold",
    },
});
