import { StyleSheet } from "react-native";
import { isTablet } from "../../../utils/funcionesMaquetado/responsiveWH";

const s = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container:
    {
        width: isTablet ? "60%" : "90%",
        maxWidth: isTablet ? 560 : undefined,
        maxHeight: "75%",
        backgroundColor: "white",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        marginBottom: 10
    },
    content: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 10,
    },
    contentContainer: {
        padding: 10,
    },
    header: {
        width: isTablet ? "60%" : "90%",
        maxWidth: isTablet ? 560 : undefined,
        backgroundColor: "white",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerTitleS:{
        justifyContent: "center",
        fontSize: 18,
        fontWeight: "bold",
        

        
    }

});

export default s;