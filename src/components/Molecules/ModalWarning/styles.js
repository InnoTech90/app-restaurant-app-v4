import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "82%",
        backgroundColor: "white",
        borderRadius: normalize(18),
        overflow: "hidden",
        alignItems: "center",
        paddingBottom: normalize(24),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 10,
    },
    accent: {
        width: "100%",
        height: normalize(6),
    },
    iconWrap: {
        marginTop: normalize(24),
        marginBottom: normalize(12),
        width: normalize(72),
        height: normalize(72),
        borderRadius: normalize(36),
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: gb.purple800,
        fontSize: normalize(17),
        fontWeight: "700",
        textAlign: "center",
        paddingHorizontal: normalize(20),
        marginBottom: normalize(8),
    },
    message: {
        color: gb.gray500,
        fontSize: normalize(13),
        textAlign: "center",
        lineHeight: normalize(20),
        paddingHorizontal: normalize(24),
        marginBottom: normalize(6),
    },
    buttonsRow: {
        flexDirection: "row",
        marginTop: normalize(20),
        gap: normalize(10),
        paddingHorizontal: normalize(16),
        width: "100%",
    },
    btnCancel: {
        flex: 1,
        paddingVertical: normalize(12),
        borderRadius: normalize(10),
        borderWidth: 1.5,
        borderColor: gb.gray300,
        alignItems: "center",
        justifyContent: "center",
    },
    btnCancelText: {
        color: gb.gray600,
        fontWeight: "600",
        fontSize: normalize(14),
    },
    btnConfirm: {
        flex: 1,
        paddingVertical: normalize(12),
        borderRadius: normalize(10),
        alignItems: "center",
        justifyContent: "center",
    },
    btnConfirmText: {
        color: "white",
        fontWeight: "700",
        fontSize: normalize(14),
    },
});