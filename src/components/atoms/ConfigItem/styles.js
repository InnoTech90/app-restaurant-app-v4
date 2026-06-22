import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(16),
        gap: normalize(12),
        backgroundColor: gb.gray50,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    iconWrap: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(8),
        backgroundColor: gb.blue550 + "1A",
        alignItems: "center",
        justifyContent: "center",
    },
    textos: {
        flex: 1,
    },
    titulo: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: gb.gray800,
    },
    subtitulo: {
        fontSize: normalize(11),
        color: gb.gray400,
        marginTop: normalize(2),
        lineHeight: normalize(15),
    },
    control: {
        alignItems: "flex-end",
        justifyContent: "center",
        minWidth: normalize(80),
    },
});
