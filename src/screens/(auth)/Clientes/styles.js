import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
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
    btnAdd: {
        width: normalize(35),
        height: normalize(35),
        borderRadius: normalize(15),
        backgroundColor: gb.gray50 + "20",
        borderWidth: normalize(1),
        borderColor: gb.gray50,
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
    },

    /* ── Body / lista ────────────────────────── */
    body: {
        flex: 1,
        backgroundColor: gb.gray100,
    },
    listContent: {
        padding: normalize(14),
        paddingBottom: normalize(30),
        gap: normalize(10),
        // En tablet: layout de 2 columnas usando flexWrap
        ...(isTablet && {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignSelf: "center",
            width: CONTENT_MAX_WIDTH,
        }),
    },
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

    /* ── Card cliente ────────────────────────── */
    card: {
        backgroundColor: "white",
        borderRadius: normalize(14),
        flexDirection: "row",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        // En tablet cada card ocupa ~48% del ancho
        ...(isTablet && { width: "48%" }),
    },
    cardAccent: {
        width: normalize(5),
    },
    cardBody: {
        flex: 1,
        padding: normalize(14),
        gap: normalize(5),
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: normalize(4),
    },
    cardAvatar: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        alignItems: "center",
        justifyContent: "center",
        marginRight: normalize(10),
    },
    cardAvatarText: {
        color: "white",
        fontWeight: "bold",
        fontSize: normalize(15),
    },
    cardNameRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    cardName: {
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(14),
        textTransform: "capitalize",
        flex: 1,
    },
    cardInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    cardInfoText: {
        color: gb.gray500,
        fontSize: normalize(12),
        flex: 1,
    },
    cardKey: {
        backgroundColor: gb.purple550 + "18",
        borderRadius: normalize(8),
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(2),
    },
    cardKeyText: {
        color: gb.purple550,
        fontSize: normalize(11),
        fontWeight: "600",
    },

    /* ── Formulario (Agregar / Editar) ────────── */
    formBody: {
        flex: 1,
        backgroundColor: gb.gray100,
    },
    formScroll: {
        padding: normalize(16),
        paddingBottom: normalize(40),
        gap: normalize(12),
    },
    sectionLabel: {
        color: gb.purple800,
        fontWeight: "700",
        fontSize: normalize(13),
        marginBottom: normalize(2),
        marginTop: normalize(8),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    saveBtn: {
        marginTop: normalize(8),
        borderRadius: normalize(12),
        overflow: "hidden",
    },
    saveBtnInner: {
        paddingVertical: normalize(14),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: normalize(8),
    },
    saveBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: normalize(15),
    },
    btnSync:{
        flexDirection: "row",
        flex:1,
        borderWidth: normalize(1),
        borderColor: gb.gray50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: gb.gray50 + "20",
        borderRadius: normalize(15),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(0),
    }  ,
    btnSyncText:{
        color: "white",
        fontWeight: "600",
        fontSize: normalize(14),
        marginLeft: normalize(6)
    },
    footer:{
        width: "100%",
        height: normalize(50),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(8),
        gap: normalize(10),
        justifyContent:"space-around"
    } 

});
