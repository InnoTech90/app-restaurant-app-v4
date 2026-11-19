import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, isTablet, normalize, wp } from "../../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    mesasContainer: {
        flexDirection: 'row',
        width: Math.min(wp(100), CONTENT_MAX_WIDTH),
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        gap: normalize(isTablet ? 14 : 10),
        padding: normalize(isTablet ? 24 : 16),
        paddingBottom: isTablet ? 40 : 30,
    }
});
