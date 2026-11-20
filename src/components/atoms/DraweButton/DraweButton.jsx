import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter, Pressable, Text, View } from "react-native";
import { SUCURSAL_INFO_UPDATED_EVENT } from "../../../screens/(auth)/PantallaDeCarga/database";
import { getDb } from "../../../utils/db";
import { logoUsable } from "../../../utils/logoSucursal";
import { useDigitalOrdersBadge } from "../../../utils/digitalOrders/badgeStore";
import { s } from "./styles";

const DrawerButton = ({ onPress, style }) => {
  const pendingCount = useDigitalOrdersBadge();
  const [logoUri, setLogoUri] = useState("");

  const cargarLogo = useCallback(async () => {
    try {
      const db = await getDb();
      const row = await db.getFirstAsync(`SELECT LOGO FROM SUCURSAL LIMIT 1`);
      setLogoUri(logoUsable(row?.LOGO));
    } catch {
      setLogoUri("");
    }
  }, []);

  useEffect(() => {
    cargarLogo();
  }, [cargarLogo]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      SUCURSAL_INFO_UPDATED_EVENT,
      (payload) => {
        if (typeof payload?.logo === "string") {
          setLogoUri(logoUsable(payload.logo));
          return;
        }
        cargarLogo();
      },
    );
    return () => sub.remove();
  }, [cargarLogo]);

  return (
    <View style={s.drawerButtonContainer}>
      <Pressable onPress={onPress} style={[s.drawerButton, style]}>
        <Image
          key={logoUri || "fallback-avatar"}
          source={
            logoUri
              ? { uri: logoUri }
              : require("../../../assets/img/avatar_app_rest.png")
          }
          style={s.drawerIcon}
          contentFit="cover"
          cachePolicy="none"
          onError={() => setLogoUri("")}
        />
        {pendingCount > 0 ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>
              {pendingCount > 9 ? "9+" : String(pendingCount)}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

export default DrawerButton;
