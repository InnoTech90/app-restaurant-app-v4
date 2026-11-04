import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { getDb } from "../db";
import { API_BASE_URL } from "../config/api";

let socket = null;
let listeners = new Set();

const getSocketBaseUrl = () => {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return String(API_BASE_URL || "").replace(/\/v1\/?$/, "");
  }
};

export async function getBranchIdLocal() {
  try {
    const stored = await AsyncStorage.getItem("branchId");
    if (stored) return stored;

    const db = await getDb();
    const row = await db.getFirstAsync(`SELECT UUID FROM SUCURSAL LIMIT 1`);
    if (row?.UUID) {
      await AsyncStorage.setItem("branchId", String(row.UUID));
      return String(row.UUID);
    }
  } catch {
    return null;
  }
  return null;
}

export async function deviceReceivesOrdersLocal() {
  try {
    const deviceKey = await AsyncStorage.getItem("deviceKey");
    const db = await getDb();

    if (deviceKey) {
      const byKey = await db.getFirstAsync(
        `SELECT RECIBE_PEDIDOS FROM DEVICE
         WHERE DEVICE_KEY = ? AND ACTIVO = 1
         LIMIT 1`,
        [deviceKey],
      );
      if (byKey) {
        return Number(byKey.RECIBE_PEDIDOS) === 1;
      }
    }

    const row = await db.getFirstAsync(
      `SELECT RECIBE_PEDIDOS FROM DEVICE WHERE ACTIVO = 1 LIMIT 1`,
    );
    return Number(row?.RECIBE_PEDIDOS) === 1;
  } catch {
    return false;
  }
}

export async function connectDigitalOrdersSocket() {
  if (socket?.connected) return socket;

  const receivesOrders = await deviceReceivesOrdersLocal();
  if (!receivesOrders) {
    return null;
  }

  const [branchId, deviceKey, apiKey] = await Promise.all([
    getBranchIdLocal(),
    AsyncStorage.getItem("deviceKey"),
    AsyncStorage.getItem("qrCode"),
  ]);

  if (!branchId || !deviceKey || !apiKey) {
    return null;
  }

  const baseUrl = getSocketBaseUrl();

  if (!socket) {
    socket = io(`${baseUrl}/digital-orders`, {
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        apiKey,
        deviceKey,
        branchId,
      },
    });

    socket.on("digital-order:created", (payload) => {
      listeners.forEach((listener) => listener("created", payload));
    });

    socket.on("digital-order:updated", (payload) => {
      listeners.forEach((listener) => listener("updated", payload));
    });

    socket.on("connect", () => {
      socket.emit("join:branch", { branchId });
    });
  }

  if (!socket.connected) {
    socket.connect();
  } else {
    socket.emit("join:branch", { branchId });
  }

  return socket;
}

export function disconnectDigitalOrdersSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeDigitalOrders(listener) {
  listeners.add(listener);
  connectDigitalOrdersSocket().catch(() => {});

  return () => {
    listeners.delete(listener);
  };
}
