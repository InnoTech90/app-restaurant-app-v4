import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

const s = StyleSheet.create({
    // ── Header ──────────────────────────────────────────────────────────────
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

    // ── Lista ────────────────────────────────────────────────────────────────
    listContent: {
        padding: normalize(16),
        gap: normalize(12),
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: normalize(80),
        gap: normalize(12),
    },
    emptyText: {
        fontSize: normalize(15),
        color: gb.gray500,
        textAlign: "center",
    },

    // ── Card impresora ────────────────────────────────────────────────────────
    card: {
        backgroundColor: "white",
        borderRadius: normalize(14),
        padding: normalize(14),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(12),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: normalize(2) },
        shadowOpacity: 0.08,
        shadowRadius: normalize(6),
        elevation: 3,
        // En tablet 2 columnas
        ...(isTablet && { flex: 1 }),
    },
    iconBox: {
        width: normalize(46),
        height: normalize(46),
        borderRadius: normalize(12),
        backgroundColor: gb.blue100,
        alignItems: "center",
        justifyContent: "center",
    },
    iconBoxLinked: {
        backgroundColor: gb.green100 || "#ddfbdf",
    },
    cardInfo: {
        flex: 1,
        gap: normalize(4),
    },
    cardNombre: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: gb.gray800,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(5),
    },
    statusDot: {
        width: normalize(7),
        height: normalize(7),
        borderRadius: normalize(4),
    },
    statusText: {
        fontSize: normalize(11),
        fontWeight: "600",
    },
    macText: {
        fontSize: normalize(10),
        color: gb.gray400,
        fontFamily: "monospace",
    },
    cardActions: {
        flexDirection: "column",
        gap: normalize(6),
        alignItems: "center",
    },
    btnVincular: {
        backgroundColor: gb.blue550,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(6),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    btnDesvincular: {
        backgroundColor: gb.red600,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(6),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    btnTest: {
        backgroundColor: gb.green500,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(6),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    btnText: {
        color: "white",
        fontSize: normalize(11),
        fontWeight: "700",
    },

    // ── Modal Bluetooth ───────────────────────────────────────────────────────
    modalBody: {
        gap: normalize(8),
    },
    scanningRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(8),
        paddingVertical: normalize(6),
    },
    scanningText: {
        fontSize: normalize(13),
        color: gb.blue550,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: gb.gray500,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginTop: normalize(6),
        marginBottom: normalize(2),
    },
    deviceItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10),
        paddingVertical: normalize(10),
        paddingHorizontal: normalize(4),
        borderBottomWidth: 1,
        borderBottomColor: gb.gray200,
    },
    deviceIconBox: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(9),
        backgroundColor: gb.blue100,
        alignItems: "center",
        justifyContent: "center",
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray800,
    },
    deviceAddress: {
        fontSize: normalize(10),
        color: gb.gray400,
        fontFamily: "monospace",
    },
    deviceConnectBtn: {
        backgroundColor: gb.blue550,
        borderRadius: normalize(8),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
    },
    deviceConnectText: {
        color: "white",
        fontSize: normalize(11),
        fontWeight: "700",
    },
    noDevicesText: {
        fontSize: normalize(13),
        color: gb.gray400,
        textAlign: "center",
        paddingVertical: normalize(10),
    },
    scanBtn: {
        backgroundColor: gb.blue550,
        borderRadius: normalize(10),
        paddingVertical: normalize(10),
        alignItems: "center",
        marginTop: normalize(8),
        flexDirection: "row",
        justifyContent: "center",
        gap: normalize(6),
    },
    scanBtnText: {
        color: "white",
        fontSize: normalize(13),
        fontWeight: "700",
    },
});

export default s;
