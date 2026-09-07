import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { useContext } from "react";
import { Text, View } from "react-native";
import { AuthContext } from "../utils/AuthContext/AuthContext";
import { normalize } from "../utils/funcionesMaquetado/responsiveWH";

export default function App() {
  const authContext = useContext(AuthContext);

  if (!authContext.isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Image
          source={require("../assets/img/logo_app_rest_blanco.png")}
          style={{
            width: normalize(300),
            height: normalize(100),
            resizeMode: "contain",
          }}
        />
        <Text style={{ color: "white", marginTop: 20, fontSize: 16 }}>
          Cargando...
        </Text>
      </View>
    );
  }
  if (authContext.autenticado) {
    if (authContext.gerenteSesion) {
      return <Redirect href="/Inicio" />;
    }
    return <Redirect href="/LoginGerente" />;
  } else {
    return <Redirect href="/Login" />;
  }
}
