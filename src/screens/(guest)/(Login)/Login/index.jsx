import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import Input from "../../../../components/atoms/Input/Input";
import QrButton from "../../../../components/atoms/QrButton/QrButton";
import ModalWarning from "../../../../components/Molecules/ModalWarning/ModalWarning";
import { AuthContext } from "../../../../utils/AuthContext/AuthContext";
import { gb } from "../../../globalStyles";
import { ApiLogin } from "./integracion";
import QrScanner from "./QrScanner";
import { s } from "./style";

function Login() {
  const contextoAutenticacion = useContext(AuthContext);

  const [showScanner, setShowScanner] = useState(false);
  const [codigoSucursal, setCodigoSucursal] = useState("");
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (!contextoAutenticacion.isReady) {
    return null;
  }

  const mostrarAviso = (title, message, type = "warning") => {
    setAviso({ title, message, type });
  };

  const handleAsociar = async () => {
    if (cargando) return;
    const codigo = String(codigoSucursal ?? "").trim();
    if (!codigo) {
      mostrarAviso(
        "Código requerido",
        "Ingresa o escanea el código de tu sucursal.",
      );
      return;
    }

    setCargando(true);
    try {
      const resultado = await ApiLogin.login(codigo);
      if (!resultado?.ok) {
        mostrarAviso(
          "No se pudo iniciar sesión",
          resultado?.message ||
            "No se pudo asociar el dispositivo. Intenta de nuevo o contacta a soporte.",
        );
        return;
      }

      const res = resultado.data;
      await AsyncStorage.setItem("deviceKey", res.device.deviceKey);
      await AsyncStorage.setItem("qrCode", codigo);
      contextoAutenticacion.autenticar();
    } catch {
      mostrarAviso(
        "No se pudo iniciar sesión",
        "No se pudo asociar el dispositivo. Intenta de nuevo o contacta a soporte.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "black" }}
        edges={["bottom"]}
      >
        <Image
          source={require("../../../../assets/img/background_registro.png")}
          style={s.loginBackground}
        />
        <View style={s.login}>
          <View style={s.logoContainer}>
            <Image
              source={require("../../../../assets/img/logo_app_rest_blanco.png")}
              style={s.logoImage}
            />
          </View>
          <View style={s.loginForm}>
            <Text style={s.title}>CÓDIGO DE SUCURSAL</Text>
            <View style={s.inputContainer}>
              <Input
                placeholder="Ingrese el código de su sucursal"
                style={s.inputQr}
                value={codigoSucursal}
                onChange={setCodigoSucursal}
              />
              <QrButton
                onPress={() => {
                  if (!cargando) setShowScanner(true);
                }}
                style={[s.qrButton, cargando && { opacity: 0.5 }]}
              />
            </View>
            <View style={s.infoContainer}>
              {__DEV__ && (
                <Text style={s.subtitle}>
                  Modo desarrollo: usa el código de tu sucursal
                </Text>
              )}
            </View>
          </View>
          <View style={s.asociarContainer}>
            <Button
              onPress={handleAsociar}
              style={[s.btn_sesion, cargando && { opacity: 0.75 }]}
              disabled={cargando}
            >
              {cargando ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <ActivityIndicator color={gb.gray50} />
                  <Text style={s.btn_sesionText}>ASOCIANDO...</Text>
                </View>
              ) : (
                <Text style={s.btn_sesionText}>ASOCIAR</Text>
              )}
            </Button>
          </View>
          <View style={s.contactoContainer}>
            <Text style={s.contactoText}>
              Contacta a nuestros asesores personales para recibir tu código de
              sucursal
            </Text>
          </View>
          <View style={s.containerButtons}>
            <Button onPress={() => {}} style={s.btnAyuda} disabled={cargando}>
              <Text style={s.btnAyudaText}>AYUDA</Text>
            </Button>
            <Button
              onPress={() => {}}
              style={s.btnContacto}
              gradient={gb.gradient_blue}
              disabled={cargando}
            >
              <Text style={s.btnContactoText}>CONTACTO</Text>
            </Button>
          </View>
        </View>
        <QrScanner
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScanned={(data) => setCodigoSucursal(data)}
        />
        <ModalWarning
          visible={!!aviso}
          type={aviso?.type ?? "warning"}
          title={aviso?.title ?? ""}
          message={aviso?.message ?? ""}
          confirmText="Entendido"
          cancelText="Cerrar"
          onCancel={() => setAviso(null)}
          onConfirm={() => setAviso(null)}
        />
      </SafeAreaView>
    </>
  );
}
export default Login;
