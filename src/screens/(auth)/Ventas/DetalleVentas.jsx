import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import ModalSinImpresora from "../../../components/atoms/ModalSinImpresora/ModalSinImpresora";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import CardProductoVenta from "../../../components/Molecules/CardProductoVenta/CardProductoVenta";
import InformacionOrden from "../../../components/Molecules/InformacionOrden/InformacionOrden";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { imprimirCuenta } from "../(mesas)/Pago/ticket";
import VentasDatabase from "./database";
import { s } from "./styles";

const estatusTexto = (estatus) => {
  if (estatus === 1) return "Pagado";
  if (estatus === 2) return "Cancelado";
  if (estatus === 3) return "Pendiente";
  return "Desconocido";
};

const estatusColor = (estatus) => {
  if (estatus === 1) return "#4CAF50";
  if (estatus === 3) return "#FF9800";
  return "#F44336";
};

const DetalleVentas = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalNip, setModalNip] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [modalSinImpresora, setModalSinImpresora] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      const cargar = async () => {
        try {
          setCargando(true);
          const data = await VentasDatabase.getDetalleVenta(id);
          if (activo) setDetalle(data);
        } catch (e) {
          console.error("Error cargando detalle venta:", e);
        } finally {
          if (activo) setCargando(false);
        }
      };
      cargar();
      return () => {
        activo = false;
      };
    }, [id]),
  );

  const comanda = detalle?.comanda;
  const articulos = detalle?.articulos ?? [];
  const puedeReimprimir = Number(comanda?.ESTATUS) === 1;
  const esCancelada = Number(comanda?.ESTATUS) === 2;

  const totalesCalculados = useMemo(() => {
    const totalArticulos = articulos.reduce(
      (acc, a) => acc + (Number(a.TOTAL) || 0),
      0,
    );
    const subtotalArticulos = articulos.reduce(
      (acc, a) =>
        acc + (Number(a.SUBTOTAL) || Number(a.TOTAL) || 0),
      0,
    );

    const totalGuardado = Number(comanda?.TOTAL) || 0;
    const subtotalGuardado = Number(comanda?.SUBTOTAL) || 0;

    return {
      total: totalGuardado > 0 ? totalGuardado : totalArticulos,
      subtotal: subtotalGuardado > 0 ? subtotalGuardado : subtotalArticulos,
      descuento: Number(comanda?.DESCUENTO) || 0,
      propina: Number(comanda?.PROPINA) || 0,
      costoEnvio: Number(comanda?.COSTO_ENVIO) || 0,
    };
  }, [comanda, articulos]);

  const formatMonto = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const ejecutarReimpresion = async () => {
    if (!comanda || imprimiendo) return;
    setImprimiendo(true);
    try {
      const mesa = { NOMBRE: comanda.MESA_NOMBRE ?? "—" };
      const cliente = comanda.CLIENTE_NOMBRE
        ? { NOMBRE: comanda.CLIENTE_NOMBRE }
        : null;

      const articulosPrint = articulos.map((art) => ({
        ...art,
        articulo: {
          NOMBRE: art.ARTICULO_NOMBRE ?? "Artículo",
        },
        complementos: (art.complementos ?? []).map((c) => ({
          ...c,
          COMP_NOMBRE: c.COMP_NOMBRE ?? "Complemento",
          COMP_PRECIO: Number(c.COMP_PRECIO ?? c.PRECIO_VENTA ?? 0),
        })),
      }));

      const pagos = detalle?.pagos ?? [];
      const pagoDividido = detalle?.pagoDividido ?? [];
      const formatosPago = detalle?.formatosPago ?? [];

      const montoRecibido =
        pagos.length === 1
          ? Number(pagos[0].CANTIDAD) || 0
          : pagos.reduce((acc, p) => acc + (Number(p.CANTIDAD) || 0), 0);

      const total = Number(comanda.TOTAL) || 0;
      const cambio = Math.max(0, montoRecibido - total);

      const metodoPago =
        comanda.FORMATO_PAGO ||
        pagos[0]?.METODO_NOMBRE ||
        "—";

      const ok = await imprimirCuenta(
        comanda,
        articulosPrint,
        mesa,
        cliente,
        {
          subtotal: Number(comanda.SUBTOTAL) || 0,
          impuestos: Number(comanda.IMPUESTOS) || 0,
          descuento: Number(comanda.DESCUENTO) || 0,
          propina: Number(comanda.PROPINA) || 0,
          costoEnvio: Number(comanda.COSTO_ENVIO) || 0,
          total,
          montoRecibido,
          cambio,
        },
        metodoPago,
        pagoDividido,
        formatosPago,
      );

      if (!ok) {
        setModalSinImpresora(true);
      }
    } catch (e) {
      console.error("Error reimprimiendo ticket de cobro:", e);
      Alert.alert(
        "Error",
        "No se pudo reimprimir el ticket. Verifica la impresora e intenta de nuevo.",
      );
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {/* header */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton href="/Ventas" />
        <View style={{ alignItems: "center" }}>
          <Text style={s.titleDetalleVenta}>Venta</Text>
          <Text style={s.venta}>Folio #{comanda?.FICHA ?? id}</Text>
        </View>
        {comanda && (
          <View
            style={{
              paddingHorizontal: normalize(8),
              paddingVertical: normalize(4),
              borderRadius: normalize(10),
              backgroundColor: estatusColor(comanda.ESTATUS),
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: normalize(11),
                fontWeight: "600",
              }}
            >
              {estatusTexto(comanda.ESTATUS)}
            </Text>
          </View>
        )}
      </LinearGradient>

      {cargando ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gb.gray50,
          }}
        >
          <ActivityIndicator size="large" color={gb.purple550} />
        </View>
      ) : !comanda ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gb.gray50,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={normalize(50)}
            color={gb.gray300}
          />
          <Text style={{ color: gb.gray400, marginTop: normalize(12) }}>
            Venta no encontrada.
          </Text>
        </View>
      ) : (
        <>
          {/* Info general */}
          <View style={s.contenidoDetalle}>
            <InformacionOrden
              montoTotal={formatMonto(totalesCalculados.total)}
              productosLength={articulos.length}
              variante={
                esCancelada
                  ? "cancelado"
                  : Number(comanda?.ESTATUS) === 3
                    ? "pendiente"
                    : "ok"
              }
            />
            {/* Fila de datos */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: normalize(8),
                marginTop: normalize(8),
              }}
            >
              <_InfoChip
                icono="grid"
                texto={comanda.MESA_NOMBRE ?? "Sin mesa"}
              />
              <_InfoChip
                icono="person"
                texto={comanda.CLIENTE_NOMBRE ?? "Sin cliente"}
              />
              <_InfoChip
                icono="wallet-outline"
                texto={comanda.FORMATO_PAGO ?? "Sin método"}
              />
              {comanda.NOTA ? (
                <_InfoChip icono="document-text-outline" texto={comanda.NOTA} />
              ) : null}
            </View>
            {/* Desglose */}
            <View style={{ marginTop: normalize(10), gap: normalize(4) }}>
              <_FilaDesglose label="Subtotal" valor={totalesCalculados.subtotal} />
              <_FilaDesglose
                label="Descuento"
                valor={totalesCalculados.descuento}
                resta
              />
              <_FilaDesglose label="Propina" valor={totalesCalculados.propina} />
              <_FilaDesglose
                label="Costo envío"
                valor={totalesCalculados.costoEnvio}
              />
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: gb.gray200,
                  paddingTop: normalize(4),
                }}
              >
                <_FilaDesglose
                  label="TOTAL"
                  valor={totalesCalculados.total}
                  bold
                />
              </View>
            </View>
          </View>

          {/* Artículos */}
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={s.contenidoProductos}>
              {articulos.map((art) => (
                <CardProductoVenta
                  key={art.ID}
                  producto={art.ARTICULO_NOMBRE ?? "Artículo"}
                  cantidad={art.CANTIDAD}
                  precioUnitario={art.PRECIO_VENTA ?? art.ARTICULO_PRECIO ?? 0}
                  complementos={(art.complementos ?? []).map((c) => ({
                    id: c.ID,
                    nombre: c.COMP_NOMBRE ?? "Complemento",
                    precio: c.COMP_PRECIO ?? 0,
                  }))}
                />
              ))}
            </View>
          </ScrollView>

          {puedeReimprimir && (
            <View style={s.footerReimprimir}>
              <Button
                styleContainer={s.btnReimprimirContainer}
                style={s.btnReimprimir}
                gradient={gb.gradient_blue}
                onPress={() => setModalNip(true)}
                disabled={imprimiendo}
              >
                <Ionicons
                  name="print-outline"
                  size={normalize(20)}
                  color={gb.gray50}
                />
                <Text style={s.btnReimprimirTexto}>
                  {imprimiendo ? "Imprimiendo..." : "Reimprimir ticket"}
                </Text>
              </Button>
            </View>
          )}
        </>
      )}

      <NipModal
        visible={modalNip}
        titulo="Reimprimir ticket"
        modo="acceso"
        keywords={["sales"]}
        onClose={() => setModalNip(false)}
        onSubmit={async () => {
          setModalNip(false);
          await ejecutarReimpresion();
        }}
      />

      <ModalSinImpresora
        visible={modalSinImpresora}
        onOmitir={() => setModalSinImpresora(false)}
        onVincular={() => {
          setModalSinImpresora(false);
          router.push("/(auth)/Impresoras");
        }}
      />
    </SafeAreaView>
  );
};

// ── Subcomponentes internos ───────────────────────────────────────────────────
const _InfoChip = ({ icono, texto }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: normalize(4),
      backgroundColor: gb.gray100,
      borderRadius: normalize(8),
      paddingHorizontal: normalize(8),
      paddingVertical: normalize(4),
    }}
  >
    <Ionicons name={icono} size={normalize(13)} color={gb.gray500} />
    <Text style={{ fontSize: normalize(12), color: gb.gray600 }}>{texto}</Text>
  </View>
);

const _FilaDesglose = ({ label, valor, resta, bold }) => {
  const num = parseFloat(valor) || 0;
  if (!bold && num === 0) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text
        style={{
          fontSize: normalize(12),
          color: gb.gray500,
          fontWeight: bold ? "700" : "400",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: normalize(12),
          color: resta ? "#F44336" : gb.gray700,
          fontWeight: bold ? "700" : "400",
        }}
      >
        {resta ? "- " : ""}$
        {num.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
};

export default DetalleVentas;
