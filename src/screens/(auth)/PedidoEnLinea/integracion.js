import {
  deviceApi,
  getDeviceAuthHeaders,
} from "../../../utils/http/deviceApi";

const normalizarLista = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  return [];
};

const mensajeDesdeError = (error, fallback) => {
  const data = error?.response?.data;
  const message = data?.message ?? data?.error ?? data?.detalle;
  if (Array.isArray(message)) return message.filter(Boolean).join("\n");
  if (typeof message === "string" && message.trim()) {
    return message.includes(" :: ")
      ? message.split(" :: ").slice(1).join(" :: ").trim()
      : message.trim();
  }
  if (typeof data === "string" && data.trim()) return data.trim();
  return fallback;
};

export const integracionPedidosEnLinea = {
  listar: async (status) => {
    const headers = await getDeviceAuthHeaders();
    try {
      const response = await deviceApi.get("/devices/digital-orders", {
        headers,
        params: status ? { status } : undefined,
      });
      return normalizarLista(response?.data);
    } catch (error) {
      if (error?.response?.status === 404) {
        return [];
      }
      const err = new Error(
        mensajeDesdeError(
          error,
          "No se pudieron cargar los pedidos en línea.",
        ),
      );
      err.cause = error;
      err.status = error?.response?.status;
      throw err;
    }
  },

  detalle: async (id) => {
    const headers = await getDeviceAuthHeaders();
    try {
      const response = await deviceApi.get(`/devices/digital-orders/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }
      const err = new Error(
        mensajeDesdeError(error, "No se pudo cargar el pedido."),
      );
      err.cause = error;
      err.status = error?.response?.status;
      throw err;
    }
  },

  actualizarEstatus: async (id, status) => {
    const headers = await getDeviceAuthHeaders();
    try {
      const response = await deviceApi.patch(
        `/devices/digital-orders/${id}/status`,
        { status },
        { headers },
      );
      return response.data;
    } catch (error) {
      const err = new Error(
        mensajeDesdeError(error, "No se pudo actualizar el pedido."),
      );
      err.cause = error;
      err.status = error?.response?.status;
      throw err;
    }
  },

  registrarPushToken: async (token, platform) => {
    const headers = await getDeviceAuthHeaders();
    try {
      const response = await deviceApi.post(
        "/devices/push-token",
        { token, platform },
        { headers },
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
