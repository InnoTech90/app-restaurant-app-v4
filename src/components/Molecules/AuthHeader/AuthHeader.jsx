import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, DeviceEventEmitter, Text, View } from "react-native";
import DrawerButton from "../../../components/atoms/DraweButton/DraweButton";
import { gb } from "../../../screens/globalStyles";
import {
  AUTH_HEADER_REFRESH_EVENT,
  AUTH_HEADER_TITLE_KEY,
} from "../../../utils/authHeaderTitle";
import ButtonMesas from "../../atoms/ButtonMesas/ButtonMesas";
import { s } from "./styles";

const esListaMesas = (pathname = "") => {
  const p = pathname.toLowerCase();
  return (
    p.includes("inicio") ||
    p.endsWith("/(mesas)") ||
    p.endsWith("/mesas") ||
    p === "/"
  );
};

const AuthHeader = ({ navigation, route, options }) => {
  const pathname = usePathname();
  const tituloBase = options?.title
    ? options.title.toUpperCase()
    : pathname.replace("/", "").toUpperCase() || "INICIO";

  const [titulo, setTitulo] = useState(tituloBase);

  const actualizarTitulo = useCallback(async () => {
    try {
      if (options?.title && options.title !== "Mesas") {
        setTitulo(options.title.toUpperCase());
        return;
      }

      if (esListaMesas(pathname)) {
        setTitulo("MESAS");
        return;
      }

      // En flujo de mesa: título = botón activo (Menu / Cliente / Comanda…)
      const tituloBoton = await AsyncStorage.getItem(AUTH_HEADER_TITLE_KEY);
      if (tituloBoton?.trim()) {
        setTitulo(tituloBoton.trim().toUpperCase());
        return;
      }

      setTitulo(tituloBase);
    } catch {
      setTitulo(tituloBase);
    }
  }, [options?.title, pathname, tituloBase]);

  useEffect(() => {
    actualizarTitulo();
  }, [actualizarTitulo]);

  useEffect(() => {
    const subApp = AppState.addEventListener("change", (state) => {
      if (state === "active") actualizarTitulo();
    });
    const subEvent = DeviceEventEmitter.addListener(
      AUTH_HEADER_REFRESH_EVENT,
      actualizarTitulo,
    );
    const unsubFocus = navigation?.addListener?.("focus", actualizarTitulo);
    return () => {
      subApp.remove();
      subEvent.remove();
      unsubFocus?.();
    };
  }, [navigation, actualizarTitulo]);

  return (
    <LinearGradient
      colors={gb.gradient_blue}
      style={s.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={s.containerHeader}>
        <DrawerButton onPress={() => navigation.openDrawer()} />

        <Text style={s.title} numberOfLines={1}>
          {titulo}
        </Text>

        <ButtonMesas />
      </View>
    </LinearGradient>
  );
};

export default AuthHeader;
