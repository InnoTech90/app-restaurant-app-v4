import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import ModalSinImpresora from "../../../components/atoms/ModalSinImpresora/ModalSinImpresora";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import CardProductoVenta from "../../../components/Molecules/CardProductoVenta/CardProductoVenta";
import InformacionOrden from "../../../components/Molecules/InformacionOrden/InformacionOrden";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import { mostrarAviso } from "../../../utils/avisoModal";
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

const parseFechaLocal = (fechaStr) => {
  if (!fechaStr) return null;
  const raw = String(fechaStr).trim();
  const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");
  const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalizada);
  const iso = sinZona ? `${normalizada}Z` : normalizada;
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const formatFechaVenta = (fechaStr) => {
  if (!fechaStr) return "—";
  const fecha = parseFechaLocal(fechaStr);
  if (!fecha) {
    const [datePart, timePart = ""] = String(fechaStr).split(" ");
    const [yyyy, mm, dd] = datePart.split("-");
    return `${dd}/${mm}/${yyyy} ${timePart.slice(0, 5)}`;
  }
  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = fecha.getFullYear();
  const hh = String(fecha.getHours()).padStart(2, "0");
  const min = String(fecha.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const nombreMetodoPago = (formaPago, formatosPago = []) => {
  const metodo = formatosPago.find(
    (f) => Number(f.ID ?? f.value) === Number(formaPago),
  );
  return metodo?.NOMBRE ?? metodo?.label ?? "Método";
};

const descuentoArticulo = (art) => {
  const guardado = Number(art?.DESCUENTO);
  if (Number.isFinite(guardado) && guardado > 0) return guardado;
  const subtotal =
    Number(art?.SUBTOTAL) ||
    (Number(art?.CANTIDAD) || 0) * (Number(art?.PRECIO_VENTA) || 0);
  const costoComps = (art?.complementos ?? []).reduce(
    (acc, c) => acc + (Number(c.COMP_PRECIO ?? c.PRECIO_VENTA) || 0),
    0,
  );
  return Math.max(0, subtotal + costoComps - (Number(art?.TOTAL) || 0));
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
  const pagoDividido = detalle?.pagoDividido ?? [];
  const formatosPago = detalle?.formatosPago ?? [];
  const tieneCuentaDividida = pagoDividido.length > 0;
  const puedeReimprimir = Number(comanda?.ESTATUS) === 1;
  const esCancelada = Number(comanda?.ESTATUS) === 2;

  const totalesCalculados = useMemo(() => {
    const totalArticulos = articulos.reduce(
      (acc, a) => acc + (Number(a.TOTAL) || 0),
      0,
    );
    const subtotalArticulos = articulos.reduce(
      (acc, a) => acc + (Number(a.SUBTOTAL) || Number(a.TOTAL) || 0),
      0,
    );
    const descuentoArticulos = articulos.reduce(
      (acc, a) => acc + descuentoArticulo(a),
      0,
    );

    const totalGuardado = Number(comanda?.TOTAL) || 0;
    const subtotalGuardado = Number(comanda?.SUBTOTAL) || 0;

    return {
      total: totalGuardado > 0 ? totalGuardado : totalArticulos,
      subtotal: subtotalGuardado > 0 ? subtotalGuardado : subtotalArticulos,
      descuentoArticulos,
      descuentoComanda: Math.abs(Number(comanda?.DESCUENTO) || 0),
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
        ? {
            NOMBRE: comanda.CLIENTE_NOMBRE,
            DIRECCION: comanda.CLIENTE_DIRECCION,
            TELEFONO: comanda.CLIENTE_TELEFONO,
            NOTAS: comanda.CLIENTE_NOTAS,
            DESCRIPCION: comanda.CLIENTE_DESCRIPCION,
          }
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

      const metodoPago = comanda.FORMATO_PAGO || pagos[0]?.METODO_NOMBRE || "—";

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
      mostrarAviso({
        type: "danger",
        title: "Error",
        message:
          "No se pudo reimprimir el ticket. Verifica la impresora e intenta de nuevo.",
      });
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
          <ScrollView
            style={s.scrollDetalle}
            contentContainerStyle={s.scrollDetalleContent}
            showsVerticalScrollIndicator
          >
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

              <View style={s.bloqueInfo}>
                <Text style={s.bloqueTitulo}>Datos de la venta</Text>
                <_DatoFila
                  icono="calendar-outline"
                  etiqueta="Fecha"
                  valor={formatFechaVenta(comanda.FECHA)}
                />
                <_DatoFila
                  icono="grid-outline"
                  etiqueta="Mesa"
                  valor={comanda.MESA_NOMBRE ?? "Sin mesa"}
                />
                <_DatoFila
                  icono="person-outline"
                  etiqueta="Cliente"
                  valor={comanda.CLIENTE_NOMBRE ?? "Sin cliente"}
                />
                <_DatoFila
                  icono="wallet-outline"
                  etiqueta="Forma de pago"
                  valor={
                    tieneCuentaDividida
                      ? "Cuenta dividida"
                      : (comanda.FORMATO_PAGO ?? "Sin método")
                  }
                  destacado={tieneCuentaDividida}
                />
                {!!comanda.NOTA && (
                  <_DatoFila
                    icono="document-text-outline"
                    etiqueta="Nota"
                    valor={comanda.NOTA}
                  />
                )}
              </View>

              <View style={s.bloqueInfo}>
                <Text style={s.bloqueTitulo}>Resumen de montos</Text>
                <_FilaDesglose
                  label="Subtotal"
                  valor={totalesCalculados.subtotal}
                />
                <_FilaDesglose
                  label="Desc. en artículos"
                  valor={totalesCalculados.descuentoArticulos}
                  resta
                />
                <_FilaDesglose
                  label="Desc. en comanda"
                  valor={totalesCalculados.descuentoComanda}
                  resta
                />
                <_FilaDesglose
                  label="Propina"
                  valor={totalesCalculados.propina}
                />
                <_FilaDesglose
                  label="Costo envío"
                  valor={totalesCalculados.costoEnvio}
                />
                <View style={s.totalSeparador}>
                  <_FilaDesglose
                    label="TOTAL"
                    valor={totalesCalculados.total}
                    bold
                  />
                </View>
              </View>

              {tieneCuentaDividida && (
                <View style={s.cuentaDivididaBox}>
                  <View style={s.cuentaDivididaHeader}>
                    <View style={s.cuentaDivididaHeaderLeft}>
                      <View style={s.cuentaDivididaIconWrap}>
                        <Ionicons
                          name="people-outline"
                          size={normalize(18)}
                          color={gb.blue550}
                        />
                      </View>
                      <View>
                        <Text style={s.cuentaDivididaTitulo}>
                          Cómo se pagó
                        </Text>
                        <Text style={s.cuentaDivididaSubtitulo}>
                          {pagoDividido.length} partes
                        </Text>
                      </View>
                    </View>
                  </View>

                  {pagoDividido.map((fila, index) => (
                    <View
                      key={String(fila.ID ?? index)}
                      style={s.cuentaDivididaCard}
                    >
                      <View style={s.cuentaDivididaBadge}>
                        <Text style={s.cuentaDivididaBadgeText}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={s.cuentaDivididaCardBody}>
                        <Text style={s.cuentaDivididaCliente}>
                          Parte {index + 1}
                        </Text>
                        <View style={s.cuentaDivididaMetodoPill}>
                          <Ionicons
                            name="card-outline"
                            size={normalize(12)}
                            color={gb.blue550}
                          />
                          <Text style={s.cuentaDivididaMetodo}>
                            {nombreMetodoPago(fila.FORMA_PAGO, formatosPago)}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.cuentaDivididaMonto}>
                        ${formatMonto(fila.TOTAL)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={s.contenidoProductos}>
              <Text style={s.bloqueTituloProductos}>Productos</Text>
              {articulos.map((art) => (
                <CardProductoVenta
                  key={art.ID}
                  producto={art.ARTICULO_NOMBRE ?? "Artículo"}
                  cantidad={art.CANTIDAD}
                  precioUnitario={art.PRECIO_VENTA ?? art.ARTICULO_PRECIO ?? 0}
                  descuento={descuentoArticulo(art)}
                  total={art.TOTAL}
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

const _DatoFila = ({ icono, etiqueta, valor, destacado = false }) => (
  <View style={s.datoFila}>
    <View style={[s.datoIcono, destacado && s.datoIconoDestacado]}>
      <Ionicons
        name={icono}
        size={normalize(16)}
        color={destacado ? gb.blue550 : gb.gray500}
      />
    </View>
    <View style={s.datoTextos}>
      <Text style={s.datoEtiqueta}>{etiqueta}</Text>
      <Text
        style={[s.datoValor, destacado && s.datoValorDestacado]}
        numberOfLines={2}
      >
        {valor}
      </Text>
    </View>
  </View>
);

const _FilaDesglose = ({ label, valor, resta, bold }) => {
  const num = parseFloat(valor) || 0;
  if (!bold && num === 0) return null;
  return (
    <View style={s.filaDesglose}>
      <Text style={[s.filaDesgloseLabel, bold && s.filaDesgloseBold]}>
        {label}
      </Text>
      <Text
        style={[
          s.filaDesgloseValor,
          bold && s.filaDesgloseBold,
          resta && s.filaDesgloseResta,
        ]}
      >
        {resta ? "- " : ""}$
        {num.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
};

export default DetalleVentas;
