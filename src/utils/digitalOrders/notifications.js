import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { integracionPedidosEnLinea } from "../../screens/(auth)/PedidoEnLinea/integracion";
import { deviceReceivesOrdersLocal } from "./socket";

let Notifications = null;
let handlerReady = false;

const loadNotifications = () => {
  if (Notifications) return Notifications;
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.warn("expo-notifications no disponible:", error?.message ?? error);
    Notifications = null;
  }
  return Notifications;
};

const ensureHandler = () => {
  if (handlerReady) return;
  const mod = loadNotifications();
  if (!mod?.setNotificationHandler) return;
  mod.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerReady = true;
};

const puedeUsarPushRemotas = () => {
  if (isRunningInExpoGo()) return false;
  if (!Device.isDevice) return false;
  return Boolean(loadNotifications());
};

export async function registerDigitalOrderPushToken() {
  const receivesOrders = await deviceReceivesOrdersLocal();
  if (!receivesOrders) {
    return null;
  }

  if (!puedeUsarPushRemotas()) {
    if (__DEV__ && isRunningInExpoGo()) {
      console.info(
        "Push de pedidos en línea omitida en Expo Go. Usa un development build para probar notificaciones remotas.",
      );
    }
    return null;
  }

  const mod = loadNotifications();
  ensureHandler();

  const { status: existingStatus } = await mod.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await mod.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await mod.setNotificationChannelAsync("digital-orders", {
      name: "Pedidos en línea",
      importance: mod.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1D4ED8",
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  const tokenResponse = await mod.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  const token = tokenResponse?.data;
  if (!token) return null;

  await integracionPedidosEnLinea.registrarPushToken(
    token,
    Platform.OS === "ios" ? "ios" : "android",
  );

  return token;
}

export function attachDigitalOrderNotificationListeners({
  onReceive,
  onRespond,
} = {}) {
  if (isRunningInExpoGo() || !Device.isDevice) {
    return () => {};
  }

  const mod = loadNotifications();
  if (!mod?.addNotificationReceivedListener) {
    return () => {};
  }

  ensureHandler();

  const receivedSub = mod.addNotificationReceivedListener((notification) => {
    const data = notification?.request?.content?.data;
    if (data?.type === "digital_order" && typeof onReceive === "function") {
      onReceive(data);
    }
  });

  const responseSub = mod.addNotificationResponseReceivedListener(
    (response) => {
      const data = response?.notification?.request?.content?.data;
      if (data?.type === "digital_order" && typeof onRespond === "function") {
        onRespond(data);
      }
    },
  );

  return () => {
    receivedSub?.remove?.();
    responseSub?.remove?.();
  };
}
