import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import {
  MENSAJE_NO_SE_PUDO_CONECTAR,
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { mostrarAviso } from "../../../utils/avisoModal";
import { refreshDigitalOrdersBadge } from "../../../utils/digitalOrders/badgeStore";
import { subscribeDigitalOrders } from "../../../utils/digitalOrders/socket";
import { gb } from "../../globalStyles";
import PedidoEnLineaDatabase from "./database";
import { integracionPedidosEnLinea } from "./integracion";
import { s } from "./styles";

const FILTERS = [
  { key: "active", label: "Activos", status: null },
  { key: "pending", label: "Pendientes", status: "pending" },
  { key: "preparing", label: "Preparación", status: "preparing" },
  { key: "ready", label: "Listos", status: "ready" },
  { key: "completed", label: "Completados", status: "completed" },
  { key: "cancelled", label: "Cancelados", status: "cancelled" },
];

const STATUS_META = {
  pending: { label: "Pendiente", color: "#B45309" },
  preparing: { label: "En preparación", color: "#1D4ED8" },
  ready: { label: "Listo", color: "#15803D" },
  completed: { label: "Completado", color: "#475569" },
  cancelled: { label: "Cancelado", color: "#B91C1C" },
};

const nextActions = (status) => {
  if (status === "pending") {
    return [
      { label: "Aceptar", status: "preparing", tone: "primary" },
      { label: "Rechazar", status: "cancelled", tone: "danger" },
    ];
  }
  if (status === "preparing") {
    return [{ label: "Marcar listo", status: "ready", tone: "primary" }];
  }
  if (status === "ready") {
    return [{ label: "Completar", status: "completed", tone: "primary" }];
  }
  return [];
};

const PedidoCard = ({ order, onAction, updatingId }) => {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const actions = nextActions(order.status);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>{order.customerName}</Text>
        <View style={[s.badge, { backgroundColor: meta.color }]}>
          <Text style={s.badgeText}>{meta.label}</Text>
        </View>
      </View>

      <Text style={s.meta}>Tel: {order.customerPhone}</Text>
      <Text style={s.meta}>
        {order.fulfillmentType === "delivery" ? "Delivery" : "Recoger"}
        {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}
      </Text>
      {order.paymentMethodName ? (
        <Text style={s.meta}>Pago: {order.paymentMethodName}</Text>
      ) : null}
      {order.notes ? <Text style={s.notes}>Nota: {order.notes}</Text> : null}

      <View style={s.itemsBox}>
        {(order.items || []).map((item) => (
          <Text key={item.id} style={s.itemLine}>
            {item.quantity}x {item.articleName}
            {(item.complements || []).length
              ? ` (${(item.complements || [])
                  .map((c) => c.complementName)
                  .join(", ")})`
              : ""}
          </Text>
        ))}
      </View>

      <Text style={s.total}>Total ${Number(order.total || 0).toFixed(2)}</Text>

      {actions.length > 0 ? (
        <View style={s.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.status}
              onPress={() => onAction(order, action.status)}
              disabled={Boolean(updatingId)}
              style={{
                backgroundColor:
                  action.tone === "danger" ? "#B91C1C" : "#1D4ED8",
                paddingHorizontal: 14,
                paddingVertical: 10,
                minWidth: 110,
                borderRadius: 10,
                opacity: updatingId ? 0.6 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {updatingId === `${order.id}:${action.status}`
                  ? "..."
                  : action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default function PedidoEnLinea() {
  const [filterKey, setFilterKey] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const selectedFilter = useMemo(
    () => FILTERS.find((item) => item.key === filterKey) || FILTERS[0],
    [filterKey],
  );

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const hayInternet = await verificarConexionInternet();
      if (!hayInternet) {
        setOrders([]);
        mostrarAviso({
          type: "warning",
          title: "Sin internet",
          message: MENSAJE_SIN_INTERNET,
        });
        return;
      }

      const data = await integracionPedidosEnLinea.listar(
        selectedFilter.status || undefined,
      );
      setOrders(Array.isArray(data) ? data : []);
      await refreshDigitalOrdersBadge();
    } catch (error) {
      setOrders([]);
      mostrarAviso({
        type: "danger",
        title: "No se pudieron cargar",
        message:
          obtenerMensajeErrorRed(
            error,
            error?.message || MENSAJE_NO_SE_PUDO_CONECTAR,
          ) || "No se pudieron cargar los pedidos",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const unsubscribe = subscribeDigitalOrders(() => {
        cargar();
      });
      return () => {
        if (typeof unsubscribe === "function") unsubscribe();
      };
    }, [cargar]),
  );

  const onUpdateStatus = async (order, status) => {
    const id = order?.id;
    setUpdatingId(`${id}:${status}`);
    try {
      if (status === "completed") {
        const detalle =
          (await integracionPedidosEnLinea.detalle(id).catch(() => null)) ||
          order;
        const registro =
          await PedidoEnLineaDatabase.registrarVentaDesdePedido(detalle);

        if (!registro?.ok) {
          if (registro?.code === "CAJA_CERRADA") {
            mostrarAviso({
              type: "warning",
              title: "Caja cerrada",
              message:
                "Abre la caja antes de completar el pedido para registrarlo en ventas.",
            });
            return;
          }
          mostrarAviso({
            type: "danger",
            title: "No se registró la venta",
            message: "No se pudo guardar el pedido en ventas.",
          });
          return;
        }
      }

      await integracionPedidosEnLinea.actualizarEstatus(id, status);
      await cargar();

      if (status === "completed") {
        mostrarAviso({
          type: "success",
          title: "Pedido completado",
          message: "Se registró en Ventas como pedido en línea.",
        });
      }
    } catch (error) {
      mostrarAviso({
        type: "danger",
        title: "No se pudo actualizar",
        message:
          obtenerMensajeErrorRed(error, error?.message) ||
          "No se pudo actualizar el pedido.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <LinearGradient
        colors={gb.gradient_blue}
        style={s.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <Pressable onPress={cargar} hitSlop={8}>
          <Ionicons name="refresh" size={22} color="white" />
        </Pressable>
      </LinearGradient>

      <View style={s.body}>
        <View style={s.filters}>
          {FILTERS.map((filter) => {
            const active = filter.key === filterKey;
            return (
              <Pressable
                key={filter.key}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setFilterKey(filter.key)}
              >
                <Text
                  style={[
                    s.filterChipText,
                    active && s.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          style={{ flex: 1, backgroundColor: gb.gray100 }}
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            s.listContent,
            orders.length === 0 && { flexGrow: 1 },
          ]}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={cargar} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={s.empty}>
                <Ionicons name="receipt-outline" size={36} color={gb.gray400} />
                <Text style={s.emptyText}>No hay pedidos en esta vista</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <PedidoCard
              order={item}
              onAction={onUpdateStatus}
              updatingId={updatingId}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
