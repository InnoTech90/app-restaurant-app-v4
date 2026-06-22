import { StyleSheet } from "react-native";
import { isTablet, normalize, wp } from "../../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    mesasContainer: {
        flexDirection: 'row',
        width: wp(100),
        flexWrap: 'wrap',
        justifyContent: isTablet ? 'flex-start' : 'space-around',
        gap: normalize(isTablet ? 16 : 10),
        padding: isTablet ? 24 : 20,
        paddingBottom: isTablet ? 40 : 30,
    }
});
