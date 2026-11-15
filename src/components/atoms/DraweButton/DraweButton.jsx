import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter, Pressable, Text, View } from "react-native";
import { SUCURSAL_INFO_UPDATED_EVENT } from "../../../screens/(auth)/PantallaDeCarga/database";
import { getDb } from "../../../utils/db";
import { useDigitalOrdersBadge } from "../../../utils/digitalOrders/badgeStore";
import { s } from "./styles";

const DrawerButton = ({ onPress, style }) => {
  const pendingCount = useDigitalOrdersBadge();
  const [logoUri, setLogoUri] = useState("");

  const cargarLogo = useCallback(async () => {
    try {
      const db = await getDb();
      const row = await db.getFirstAsync(`SELECT LOGO FROM SUCURSAL LIMIT 1`);
      const uri = typeof row?.LOGO === "string" ? row.LOGO.trim() : "";
      setLogoUri(uri);
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
          setLogoUri(payload.logo.trim());
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
