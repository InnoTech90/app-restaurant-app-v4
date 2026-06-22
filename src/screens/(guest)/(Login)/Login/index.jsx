import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import Input from "../../../../components/atoms/Input/Input";
import QrButton from "../../../../components/atoms/QrButton/QrButton";
import { AuthContext } from "../../../../utils/AuthContext/AuthContext";
import { gb } from "../../../globalStyles";
import QrScanner from "./QrScanner";
import { s } from "./style";
import { ApiLogin } from "./integracion";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Login() {
    const Router = useRouter();
    const contextoAutenticacion = useContext(AuthContext);

    // ✅ Hooks siempre antes de cualquier return condicional
    const [showScanner, setShowScanner] = useState(false);
    const [codigoSucursal, setCodigoSucursal] = useState("");

    if (!contextoAutenticacion.isReady) {
        return null;
    }
    const handleAsociar = async () => {
        try {

            await ApiLogin.login(codigoSucursal).then(async (res) => {
                await AsyncStorage.setItem("deviceKey", res.device.deviceKey);
                await AsyncStorage.setItem("qrCode", codigoSucursal);
                contextoAutenticacion.autenticar()

            });
            // Aquí puedes manejar la respuesta del backend, por ejemplo, guardar el token de autenticación
        } catch (error) {
            console.error("Error during login:", error);
            // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje al usuario
        }
    }

    return <>
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["bottom"]}>
            <Image source={require("../../../../assets/img/background_registro.png")} style={s.loginBackground} />
            <View style={s.login}>
                <View style={s.logoContainer}>
                    <Image source={require("../../../../assets/img/logo_app_rest_blanco.png")} style={s.logoImage} />
                </View>
                <View style={s.loginForm}>
                    <Text style={s.title}>CÓDIGO DE SUCURSAL</Text>
                    <View style={s.inputContainer}>
                        <Input placeholder="Ingrese el código de su sucursal" style={s.inputQr} value={codigoSucursal} onChange={setCodigoSucursal} />
                        <QrButton onPress={() => setShowScanner(true)} style={s.qrButton} />
                    </View>
                    <View style={s.infoContainer}>
                        <Text style={s.subtitle}>Código de demostración: 123456</Text>
                    </View>
                </View>
                <View style={s.asociarContainer}>
                    <Button onPress={handleAsociar} style={s.btn_sesion} ><Text style={s.btn_sesionText}>ASOCIAR</Text></Button>
                </View>
                <View style={s.contactoContainer}>
                    <Text style={s.contactoText}>Contacta a nuestros asesores personales para recibir tu código de sucursal</Text>
                </View>
                <View style={s.containerButtons}>
                    <Button onPress={() => console.log("Contactando asesores personales")} style={s.btnAyuda} ><Text style={s.btnAyudaText}>AYUDA</Text></Button>
                    <Button onPress={() => console.log("Contactando asesores personales")} style={s.btnContacto} gradient={gb.gradient_blue} ><Text style={s.btnContactoText}>CONTACTO</Text></Button>
                </View>
            </View>
            <QrScanner visible={showScanner} onClose={() => setShowScanner(false)} onScanned={(data) => setCodigoSucursal(data)} />
        </SafeAreaView>
    </>
}
export default Login;
