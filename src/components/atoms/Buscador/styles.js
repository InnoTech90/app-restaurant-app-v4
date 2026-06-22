import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    buscadorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: gb.gray100,
        borderRadius: normalize(10),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(6),
    },
    icon: {
        marginRight: normalize(8),
    },
    input: {
        flex: 1,
        fontSize: normalize(14),
        color: gb.gray800,
        paddingVertical: normalize(4),
    },
});
