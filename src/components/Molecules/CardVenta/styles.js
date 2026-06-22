import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    shadow: {
        width: "100%",
        borderRadius: normalize(12),
        marginBottom: normalize(12),
        backgroundColor: gb.gray50,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: normalize(12),
        shadowOffset: { width: 0, height: normalize(4) },
        elevation: normalize(2),

    },
    container: {
        borderRadius: normalize(12),
        overflow: "hidden",
    },
    header: {
        width: "100%",
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(8),
    },
    fichaContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: normalize(8),
    },
    checkbox: {
        padding: normalize(2),
    },
    ficha: {
        alignItems: "center",
        flex: 1,
    },
    fichaText: {
        fontSize: normalize(10),
        color: gb.gray500,
        textTransform: "uppercase",
        letterSpacing: normalize(0.5),
    },
    fichaNumber: {
        fontSize: normalize(13),
        fontWeight: "bold",
        color: gb.gray800,
    },
    status: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(4),
        backgroundColor: gb.green600,
        borderRadius: normalize(20),
    },
    statusText: {
        color: "white",
        fontSize: normalize(11),
        fontWeight: "bold",
    },
    body: {
        padding: normalize(12),
        backgroundColor: gb.gray50,
    },
    rowSpaceBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    mesaContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    mesa: {
        fontSize: normalize(14),
        fontWeight: "bold",
        color: gb.gray800,
    },
    total: {
        fontSize: normalize(18),
        fontWeight: "bold",
        color: gb.blue550,
    },
    lineaSeparadora: {
        height: 1,
        backgroundColor: gb.gray200,
        marginVertical: normalize(6),
    },
    infoChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4),
    },
    infoText: {
        fontSize: normalize(12),
        color: gb.gray500,
    },
    btnVer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(6),
        marginTop: normalize(4),
        paddingVertical: normalize(7),
        borderRadius: normalize(15),
        borderWidth: 1,
        borderColor: gb.purple550,
        backgroundColor: gb.blue50,
        width:normalize(100),
    },
    btnVerText: {
        fontSize: normalize(13),
        fontWeight: "bold",
        color: gb.purple550,
    },
});