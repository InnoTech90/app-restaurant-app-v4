import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: gb.gray200,
        borderRadius: normalize(8),
        overflow: "hidden",
        backgroundColor: gb.gray50,
    },
    input: {
        width: normalize(60),
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(5),
        fontSize: normalize(13),
        color: gb.gray800,
        textAlign: "right",
    },
    badge: {
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(6),
        backgroundColor: gb.gray100,
        borderLeftWidth: 1,
        borderLeftColor: gb.gray200,
    },
    badgeActive: {
        backgroundColor: gb.blue550,
    },
    badgeText: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: gb.gray600,
    },
    badgeTextActive: {
        color: gb.gray50,
    },
});
