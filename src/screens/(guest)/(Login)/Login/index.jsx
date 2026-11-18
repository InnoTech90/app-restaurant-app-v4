import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import Input from "../../../../components/atoms/Input/Input";
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
      <SafeAreaView style={s.safe} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <LinearGradient
              colors={[gb.purple550, "#93D9F4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.hero}
            >
              <View style={[s.circulo, s.circuloGrande]} />
              <View style={[s.circulo, s.circuloChico]} />
              <SafeAreaView edges={["top"]} style={s.heroContenido}>
                <Image
                  source={require("../../../../assets/img/logo_app_rest_blanco.png")}
                  style={s.logoImage}
                  contentFit="contain"
                />
                <Text style={s.lema}>Punto de venta para tu restaurante</Text>
              </SafeAreaView>
            </LinearGradient>

            <View style={s.hoja}>
              <Text style={s.etiqueta}>VINCULAR DISPOSITIVO</Text>
              <Text style={s.title}>Asocia tu dispositivo</Text>
              <Text style={s.subtitle}>
                Escanea el código QR de tu sucursal o escríbelo a mano.
              </Text>

              <Pressable
                onPress={() => {
                  if (!cargando) setShowScanner(true);
                }}
                style={({ pressed }) => [
                  s.escanear,
                  pressed && s.escanearPresionado,
                  cargando && { opacity: 0.5 },
                ]}
              >
                <LinearGradient
                  colors={[gb.purple550, "#93D9F4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.escanearIcono}
                >
                  <Ionicons name="qr-code-outline" size={26} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={s.escanearTitulo}>Escanear código QR</Text>
                  <Text style={s.escanearTexto}>
                    Usa la cámara de este dispositivo
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={gb.purple550}
                />
              </Pressable>

              <View style={s.separador}>
                <View style={s.linea} />
                <Text style={s.separadorTexto}>o escribe el código</Text>
                <View style={s.linea} />
              </View>

              <Input
                placeholder="Código de sucursal"
                icon="keypad-outline"
                iconColor={gb.purple500}
                style={s.inputQr}
                styleInput={s.inputField}
                value={codigoSucursal}
                onChange={setCodigoSucursal}
              />

              {__DEV__ ? (
                <Text style={s.devHint}>Código de demo: 123456</Text>
              ) : null}

              <Button
                onPress={handleAsociar}
                gradient={[gb.purple550, "#93D9F4"]}
                styleContainer={s.btnContenedor}
                style={[s.btn_sesion, cargando && { opacity: 0.75 }]}
                disabled={cargando}
              >
                {cargando ? (
                  <View style={s.loadingRow}>
                    <ActivityIndicator color="#fff" />
                    <Text style={s.btn_sesionText}>Asociando…</Text>
                  </View>
                ) : (
                  <Text style={s.btn_sesionText}>Asociar</Text>
                )}
              </Button>

              <View style={s.ayuda}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={gb.purple600}
                />
                <Text style={s.ayudaTexto}>
                  El código está en tu panel web, en{" "}
                  <Text style={s.ayudaFuerte}>Obtener QR</Text> de la sucursal.
                  Si aún no tienes acceso, contacta a tu asesor.
                </Text>
              </View>
            </View>
          </ScrollView>
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
