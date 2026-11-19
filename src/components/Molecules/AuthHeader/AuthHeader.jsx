import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  DeviceEventEmitter,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import DrawerButton from "../../../components/atoms/DraweButton/DraweButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "../../../utils/theme";
import {
  AUTH_HEADER_REFRESH_EVENT,
  AUTH_HEADER_TITLE_KEY,
} from "../../../utils/authHeaderTitle";
import { useDigitalOrdersBadge } from "../../../utils/digitalOrders/badgeStore";
import ButtonMesas from "../../atoms/ButtonMesas/ButtonMesas";
import { s } from "./styles";
import { getDb } from "../../../utils/db";

import { esOscuro } from "../../../utils/apariencia";
import { color as tema } from "../../../utils/theme";
const esListaMesas = (pathname = "") => {
  const p = pathname.toLowerCase();
  return (
    p.includes("inicio") ||
    p.endsWith("/(mesas)") ||
    p.endsWith("/mesas") ||
    p === "/"
  );
};

/** "MENU PRINCIPAL" → "Menu principal" (el título se guarda en mayúsculas). */
const tituloLegible = (texto = "") => {
  const t = String(texto).trim().toLowerCase();
  const legible = t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
  return legible === "Menu" ? "Menú" : legible;
};

const AuthHeader = ({ navigation, route, options }) => {
  const [sucursal, setSucursal] = useState("");
  useEffect(() => {
    let vivo = true;
    getDb()
      .then((db) => db.getFirstAsync(`SELECT NOMBRE FROM SUCURSAL LIMIT 1`))
      .then((row) => vivo && setSucursal(row?.NOMBRE ?? ""))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);
  const pathname = usePathname();
  const pendingOrders = useDigitalOrdersBadge();
  const tituloBase = options?.title
    ? options.title.toUpperCase()
    : pathname.replace("/", "").toUpperCase() || "INICIO";

  const [titulo, setTitulo] = useState(tituloBase);
  const insets = useSafeAreaInsets();

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
    <View style={[s.header, { paddingTop: insets.top + space.sm }]}>
      <StatusBar barStyle={esOscuro ? "light-content" : "dark-content"} backgroundColor={tema.surface} />
      <View style={s.containerHeader}>
        <DrawerButton onPress={() => navigation.openDrawer()} />

        <View style={s.titleBlock}>
          <Text style={s.title} numberOfLines={1}>
            {tituloLegible(titulo)}
          </Text>
          {sucursal ? (
            <Text style={s.subtitle} numberOfLines={1}>
              {sucursal}
            </Text>
          ) : null}
        </View>

        <View style={s.rightActions}>
          {pendingOrders > 0 ? (
            <Pressable
              style={s.ordersBadgeBtn}
              onPress={() => navigation.navigate("PedidoEnLinea/index")}
              hitSlop={8}
            >
              <Text style={s.ordersBadgeText}>
                {pendingOrders > 9 ? "9+" : String(pendingOrders)}
              </Text>
            </Pressable>
          ) : null}
          <ButtonMesas />
        </View>
      </View>
    </View>
  );
};

export default AuthHeader;
