import { StyleSheet } from "react-native";
import { hp, isTablet, normalize, wp } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
    main: {
           height: hp(100) + normalize(100),
           justifyContent: "center",
           alignItems: "center",
       },
       Background: {
           position: "absolute",
           width: "100%",
           height: "100%",
           objectFit: "cover",
       },
      
       logoContainer: {
           justifyContent: "center",
           alignItems: "center",
       },
       logoImage: {
           width: isTablet ? 320 : wp(80),
           height: isTablet ? 140 : hp(20),
           objectFit: "contain",
       },
       loginForm: {
           width: isTablet ? 480 : "100%",
       },
       tituloContainer:{
              width: isTablet ? 480 : "100%",
                paddingHorizontal: normalize(20),
                alignItems: "center",
       },
       titulo:{
                fontSize: normalize(24),
                color: gb.gray50,
                marginBottom: normalize(20),
                fontWeight: "bold",
       },
       containerLoading:{
           justifyContent: "center",
           alignItems: "center",
           marginTop: normalize(20),
           marginBottom: normalize(40),
       }
   
});

