import { Redirect } from "expo-router";
import { AuthContext } from "../utils/AuthContext/AuthContext";
import { useContext } from "react";
import useConeccionAInternet from "../utils/ConeccionAInternet/ConeccionAInternet";
import { View } from "react-native";
import { Image } from "expo-image";
import { normalize } from "../utils/funcionesMaquetado/responsiveWH";

export default function App() {
    const authContext = useContext(AuthContext);
    const coneccionAInternet = useConeccionAInternet();
    console.log("coneccionAInternet",coneccionAInternet.isConnected);
    
    if(!authContext.isReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center",backgroundColor:"black" }}>
                <Image
                    source={require('../assets/img/logo_app_rest_blanco.png')}
                    style={{ width: normalize(300), height: normalize(100), resizeMode: "contain" }}
                />
            </View>
        );
    }
    if (authContext.autenticado) {
        // si hay internet carga pantalla de cargga si no inicio
        if (coneccionAInternet.isConnected) {
            return <Redirect href="/PantallaDeCarga" />;
        } else {
            return <Redirect href="/Inicio" />;
        }
    }
    else {
        return <Redirect href="/Login" />;
    }
    
}
