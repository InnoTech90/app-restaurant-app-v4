import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
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
      <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
        <Image
          source={require("../../../../assets/img/background_registro.png")}
          style={s.loginBackground}
          contentFit="cover"
        />
        <View style={s.overlay} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.login}>
            <View style={s.content}>
              <View style={s.logoContainer}>
                <Image
                  source={require("../../../../assets/img/logo_app_rest_blanco.png")}
                  style={s.logoImage}
                  contentFit="contain"
                />
              </View>

              <View style={s.panel}>
                <Text style={s.title}>Asocia tu dispositivo</Text>
                <Text style={s.subtitle}>
                  Ingresa el código de tu sucursal o escanea el código QR.
                </Text>

                <View style={s.inputContainer}>
                  <Input
                    placeholder="Código de sucursal"
                    style={s.inputQr}
                    styleInput={s.inputField}
                    value={codigoSucursal}
                    onChange={setCodigoSucursal}
                  />
                  <View
                    style={[s.qrButtonWrap, cargando && { opacity: 0.5 }]}
                  >
                    <QrButton
                      onPress={() => {
                        if (!cargando) setShowScanner(true);
                      }}
                      style={s.qrButton}
                    />
                  </View>
                </View>

                {__DEV__ ? (
                  <Text style={s.devHint}>Código de demo: 123456</Text>
                ) : null}

                <View style={s.asociarContainer}>
                  <Button
                    onPress={handleAsociar}
                    style={[s.btn_sesion, cargando && { opacity: 0.75 }]}
                    disabled={cargando}
                  >
                    {cargando ? (
                      <View style={s.loadingRow}>
                        <ActivityIndicator color={gb.gray50} />
                        <Text style={s.btn_sesionText}>Asociando…</Text>
                      </View>
                    ) : (
                      <Text style={s.btn_sesionText}>Asociar</Text>
                    )}
                  </Button>
                </View>
              </View>

              <View style={s.footer}>
                <Text style={s.contactoText}>
                  Si aún no tienes código, contacta a tu asesor.
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

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
