import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, contentPaddingH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
export const s = StyleSheet.create({

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
    container: {
        flex: 1,
        alignItems: "center",
        padding: normalize(20),
        backgroundColor: gb.gray50,
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    logoContainer: {
        width: "100%",
        padding: normalize(20),
        alignItems: "center",
        backgroundColor: gb.blue950,
        borderRadius: normalize(15),
        
    },
    img: {
        width: '100%',
        height: normalize(100),
    },
    titleCard: {
        width: "100%",
        fontSize: normalize(18),
        textAlign: "center",
        color: gb.blue550,
        fontWeight: "bold",
    },
    bodyCard: {
        width: "100%",
        borderTopLeftRadius: normalize(15),
        borderTopRightRadius: normalize(15),
        borderBottomEndRadius: normalize(15),
        borderBottomStartRadius: normalize(15),
        padding: normalize(20),
        backgroundColor: gb.gray50,
        height: "auto",
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(15),
        paddingVertical: normalize(10),
        borderBottomWidth: normalize(1),
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        width: normalize(40),
        height: normalize(40),
        backgroundColor: '#E8F4FD',
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(15),
    },
    iconText: {
        fontSize: normalize(18),
    },
    infoDetails: {
        flex: 1,
    },
    infoLabel: {
        fontSize: normalize(14),
        color: '#666',
        fontWeight: '500',
        marginBottom: normalize(2),
    },
    infoValue: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: '#082644',
    },
}
)