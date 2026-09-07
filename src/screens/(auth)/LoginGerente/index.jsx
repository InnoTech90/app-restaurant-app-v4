import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import Input from "../../../components/atoms/Input/Input";
import Select from "../../../components/atoms/Select/Select";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { useManagers } from "./integracion";

const LoginGerente = () => {
  const { iniciarSesionGerente, desautenticar } = useContext(AuthContext);
  const { managersState, isLoading, error } = useManagers();
  const [managerId, setManagerId] = useState(null);
  const [nip, setNip] = useState("");
  const [enviando, setEnviando] = useState(false);

  const seleccionado = useMemo(
    () => managersState.find((m) => m.value === managerId) ?? null,
    [managersState, managerId],
  );

  const handleCerrarDispositivo = () => {
    Alert.alert(
      "Cerrar sesión del dispositivo",
      "Se cerrará por completo y volverás a la pantalla inicial (código de sucursal). ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar todo",
          style: "destructive",
          onPress: () => desautenticar(),
        },
      ],
    );
  };

  const handleEntrar = async () => {
    if (!seleccionado) {
      Alert.alert("Selecciona un usuario", "Elige tu nombre en la lista.");
      return;
    }
    if (!String(nip).trim()) {
      Alert.alert("NIP requerido", "Ingresa tu NIP para continuar.");
      return;
    }
    if (String(nip).trim() !== String(seleccionado.nip ?? "").trim()) {
      Alert.alert("NIP incorrecto", "El NIP no coincide con el usuario seleccionado.");
      return;
    }

    try {
      setEnviando(true);
      const permisos =
        seleccionado.tipo === "owner"
          ? []
          : await Database.getPermisosGerente(seleccionado.value);

      await iniciarSesionGerente({
        id: seleccionado.value,
        nombre: seleccionado.label,
        tipo: seleccionado.tipo,
        nip: String(seleccionado.nip ?? ""),
        permisos,
      });
    } catch (err) {
      console.error("Error iniciando sesión de gerente:", err);
      Alert.alert("Error", "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["bottom"]}>
      <Image
        source={require("../../../assets/img/background_registro.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: normalize(24),
        }}
      >
        <View style={{ alignItems: "center", marginBottom: normalize(32) }}>
          <Image
            source={require("../../../assets/img/logo_app_rest_blanco.png")}
            style={{
              width: normalize(220),
              height: normalize(72),
              resizeMode: "contain",
            }}
          />
          <Text
            style={{
              color: gb.gray50,
              fontSize: normalize(18),
              fontWeight: "700",
              marginTop: normalize(16),
            }}
          >
            Iniciar sesión
          </Text>
          <Text
            style={{
              color: gb.gray200,
              fontSize: normalize(13),
              marginTop: normalize(6),
              textAlign: "center",
            }}
          >
            Selecciona tu usuario e ingresa tu NIP
          </Text>
        </View>

        <View
          style={{
            backgroundColor: gb.gray50,
            borderRadius: normalize(16),
            padding: normalize(20),
            gap: normalize(14),
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={gb.blue550} />
          ) : error ? (
            <Text style={{ color: "red", textAlign: "center" }}>
              No se pudieron cargar los usuarios.
            </Text>
          ) : managersState.length === 0 ? (
            <Text style={{ color: gb.gray700, textAlign: "center" }}>
              No hay usuarios disponibles. Sincroniza los datos e intenta de nuevo.
            </Text>
          ) : (
            <>
              <Select
                label="Usuario"
                options={managersState}
                value={managerId}
                onChange={(value) => {
                  setManagerId(value);
                  setNip("");
                }}
                placeholder="Selecciona tu nombre"
              />
              <Input
                label="NIP"
                placeholder="••••"
                value={nip}
                onChange={setNip}
                secureTextEntry
                keyboardType="numeric"
                maxLength={8}
                icon="lock-closed"
                iconColor={gb.purple500}
                styleInput={{
                  textAlign: "center",
                  letterSpacing: 6,
                  fontSize: normalize(18),
                }}
              />
              <Button
                onPress={handleEntrar}
                disabled={enviando}
                gradient={gb.gradient_blue}
                styleContainer={{ marginTop: normalize(8) }}
              >
                <Text style={{ color: gb.gray50, fontWeight: "700" }}>
                  {enviando ? "Validando..." : "Entrar"}
                </Text>
              </Button>
            </>
          )}

          <Button
            onPress={handleCerrarDispositivo}
            style={{
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: gb.gray300,
            }}
            styleContainer={{ marginTop: normalize(4) }}
          >
            <Text style={{ color: gb.gray700, fontWeight: "600" }}>
              Cerrar sesión del dispositivo
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginGerente;
