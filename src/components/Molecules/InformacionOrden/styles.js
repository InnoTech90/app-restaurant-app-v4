import { StyleSheet } from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    infoCard: {
        borderRadius: normalize(16),
        overflow: 'hidden',
        marginBottom: normalize(20),
        elevation: normalize(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: normalize(2) },
        shadowOpacity: 0.1,
        shadowRadius: normalize(4),
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(20),
    },
    infoHeaderText: {
        flex: 1,
        marginLeft: normalize(12),
    },
    infoTitle: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: 'white',
    },
    infoSubtitle: {
        fontSize:   normalize(14),
        color: 'rgba(255,255,255,0.8)',
        marginTop: normalize(2),
    },
     totalAmount: {
        fontSize: normalize(24),
        fontWeight: 'bold',
        color: 'white',
    },
})