import { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { integracionPedidosEnLinea } from "../../screens/(auth)/PedidoEnLinea/integracion";

export const DIGITAL_ORDERS_BADGE_EVENT = "digital-orders-badge-changed";
export const DIGITAL_ORDERS_CAPABILITY_EVENT =
  "digital-orders-capability-changed";

let pendingCount = 0;
let refreshing = false;

export function getDigitalOrdersPendingCount() {
  return pendingCount;
}

export function setDigitalOrdersPendingCount(count) {
  const next = Math.max(0, Number(count) || 0);
  if (next === pendingCount) return pendingCount;
  pendingCount = next;
  DeviceEventEmitter.emit(DIGITAL_ORDERS_BADGE_EVENT, pendingCount);
  return pendingCount;
}

export function notifyDigitalOrdersCapabilityChanged() {
  DeviceEventEmitter.emit(DIGITAL_ORDERS_CAPABILITY_EVENT);
}

export async function refreshDigitalOrdersBadge() {
  if (refreshing) return pendingCount;
  refreshing = true;

  try {
    const data = await integracionPedidosEnLinea.listar("pending");
    const count = Array.isArray(data) ? data.length : 0;
    setDigitalOrdersPendingCount(count);
    return count;
  } catch {
    return pendingCount;
  } finally {
    refreshing = false;
  }
}

export function useDigitalOrdersBadge() {
  const [count, setCount] = useState(pendingCount);

  useEffect(() => {
    setCount(pendingCount);
    const sub = DeviceEventEmitter.addListener(
      DIGITAL_ORDERS_BADGE_EVENT,
      setCount,
    );
    return () => sub.remove();
  }, []);

  return count;
}
