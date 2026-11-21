import { SINCRONIZACION_AUTOMATICA_EVENT } from "../../../utils/http/sincronizarEnSegundoPlano";
import { Ionicons } from "@expo/vector-icons";
import HeaderBar from "../../../components/atoms/HeaderBar/HeaderBar";
import { LinearGradient } from "../../../components/atoms/FondoSolido/FondoSolido";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import CardVenta from "../../../components/Molecules/CardVenta/CardVenta";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import { dataBase } from "../../../components/Molecules/NipModal/database";
import ModalWarning from "../../../components/Molecules/ModalWarning/ModalWarning";
import SincronizadoFooter from "../../../components/Molecules/SincronizadoFooter/SincronizadoFooter";
import {
  autorizarVentas,
  tieneAccesoVentas,
} from "../../../utils/sectionAccess";
import {
  MENSAJE_NO_SE_PUDO_CONECTAR,
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { mostrarAviso } from "../../../utils/avisoModal";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import VentasDatabase from "./database";
import { integracionVentas } from "./integracion";
import { s } from "./styles";
import { imprimirCorteGeneral, imprimirCorteResumen } from "./ticket";

import { color as tema } from "../../../utils/theme";
const ventaEstaSincronizada = (venta) => Number(venta?.SINCRONIZADO) === 1;

const ventaEsLimpiable = (venta) => {
  const estatus = Number(venta?.ESTATUS);
  return ventaEstaSincronizada(venta) && (estatus === 1 || estatus === 2);
};

const estatusTexto = (estatus) => {
  const valor = Number(estatus);
  if (valor === 1) return "Pagado";
  if (valor === 2) return "Cancelado";
  if (valor === 3) return "Pendiente";
  return "Desconocido";
};

const parseFechaLocal = (fechaStr) => {
  if (!fechaStr) return null;

  const raw = String(fechaStr).trim();
  const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");

  // SQLite CURRENT_TIMESTAMP guarda en UTC sin sufijo de zona.
  const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalizada);
  const iso = sinZona ? `${normalizada}Z` : normalizada;

  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const formatFecha = (fechaStr) => {
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

const formatTotal = (total) =>
  `$${(total ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const esVentaDeHoy = (fechaStr) => {
  const fecha = parseFechaLocal(fechaStr);
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  return fecha >= hoy && fecha < manana;
};

const PAGINA_ANTERIORES = 100;

const Ventas = () => {
  const [filtroPeriodo, setFiltroPeriodo] = useState("Hoy");
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("Todas");
  const [modalNip, setModalNip] = useState(false);
  const [modalAcceso, setModalAcceso] = useState(false);
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [modalNoBorrar, setModalNoBorrar] = useState(false);
  const [modalConfirmLimpiar, setModalConfirmLimpiar] = useState(false);
  const [cantidadALimpiar, setCantidadALimpiar] = useState(0);
  const [aviso, setAviso] = useState(null);
  const [modalCorte, setModalCorte] = useState(false);
  const [imprimiendoCorte, setImprimiendoCorte] = useState(false);
  const idsALimpiarRef = useRef([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [ventas, setVentas] = useState([]);
  // Paginado de "Anteriores": Hoy se carga completo; el historial solo cuando
  // se abre la pestaña y de PAGINA_ANTERIORES en PAGINA_ANTERIORES.
  const [totalAnteriores, setTotalAnteriores] = useState(0);
  const [resumenAnteriores, setResumenAnteriores] = useState({
    total: 0,
    efectivo: 0,
  });
  const [anterioresCargadas, setAnterioresCargadas] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [recarga, setRecarga] = useState(0);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(SINCRONIZACION_AUTOMATICA_EVENT, (e) => {
      if (e?.modulo === "ventas") setRecarga((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  const [sincronizando, setSincronizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const verificarAcceso = async () => {
        const configuraciones = await dataBase.getConfiguracionesModel();
        const config = configuraciones?.[0];

        if (!config?.PROTEGER_VENTAS || tieneAccesoVentas()) {
          if (activo) {
            setAccesoPermitido(true);
            setModalAcceso(false);
          }
          return;
        }

        if (activo) {
          setAccesoPermitido(false);
          setModalAcceso(true);
        }
      };

      verificarAcceso();
      return () => {
        activo = false;
      };
    }, []),
  );

  const onAccesoCorrecto = useCallback(async () => {
    autorizarVentas();
    setAccesoPermitido(true);
    setModalAcceso(false);
  }, []);

  const onAccesoCancelado = useCallback(() => {
    setModalAcceso(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/Inicio");
    }
  }, []);

  // ── Cargar ventas al enfocar pantalla ──────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!accesoPermitido) return;

      let activo = true;
      const cargar = async () => {
        try {
          setCargando(true);
          const [data, anteriores] = await Promise.all([
            VentasDatabase.getVentas({ periodo: "hoy" }),
            VentasDatabase.resumenVentasAnteriores(),
          ]);
          if (activo) {
            // Agregar campo seleccionado para el checkbox de limpiar
            setVentas(data.map((v) => ({ ...v, seleccionado: false })));
            setTotalAnteriores(anteriores.cantidad);
            setResumenAnteriores({
              total: anteriores.total,
              efectivo: anteriores.efectivo,
            });
            setAnterioresCargadas(0);
          }
        } catch (e) {
          console.error("Error cargando ventas:", e);
          if (activo) setErrorCarga(String(e?.message ?? e));
        } finally {
          if (activo) setCargando(false);
        }
      };
      cargar();
      return () => {
        activo = false;
      };
    }, [accesoPermitido, recarga]),
  );

  const cargarMasAnteriores = useCallback(async () => {
    if (cargandoMas || anterioresCargadas >= totalAnteriores) return;
    setCargandoMas(true);
    try {
      const pagina = await VentasDatabase.getVentas({
        periodo: "anteriores",
        limite: PAGINA_ANTERIORES,
        desde: anterioresCargadas,
      });
      setVentas((prev) => {
        const ids = new Set(prev.map((v) => Number(v.ID)));
        const nuevas = pagina
          .filter((v) => !ids.has(Number(v.ID)))
          .map((v) => ({ ...v, seleccionado: false }));
        return [...prev, ...nuevas];
      });
      setAnterioresCargadas((n) => n + pagina.length);
    } catch (e) {
      console.error("Error cargando ventas anteriores:", e);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, anterioresCargadas, totalAnteriores]);

  // Primera página al abrir la pestaña Anteriores.
  useEffect(() => {
    if (
      filtroPeriodo === "Anteriores" &&
      !cargando &&
      anterioresCargadas === 0 &&
      totalAnteriores > 0
    ) {
      cargarMasAnteriores();
    }
  }, [filtroPeriodo, cargando, anterioresCargadas, totalAnteriores, cargarMasAnteriores]);

  const ventasDelPeriodo = useMemo(() => {
    if (filtroPeriodo === "Anteriores") {
      return ventas.filter((v) => !esVentaDeHoy(v.FECHA));
    }
    return ventas.filter((v) => esVentaDeHoy(v.FECHA));
  }, [ventas, filtroPeriodo]);

  const ventasFiltradasState = useMemo(() => {
    if (filtroSeleccionado === "Pendientes") {
      return ventasDelPeriodo.filter((v) => Number(v.ESTATUS) === 3);
    }
    if (filtroSeleccionado === "Canceladas") {
      return ventasDelPeriodo.filter((v) => Number(v.ESTATUS) === 2);
    }
    return ventasDelPeriodo;
  }, [ventasDelPeriodo, filtroSeleccionado]);

  const totalFiltrado = useMemo(
    () =>
      ventasDelPeriodo
        .filter(
          (v) =>
            Number(v.ESTATUS) === 1 &&
            (v.FORMATO_PAGO ?? "").toLowerCase().includes("efectivo"),
        )
        .reduce((sum, v) => sum + (Number(v.TOTAL) || 0), 0),
    [ventasDelPeriodo],
  );
  const totalGeneral = useMemo(
    () =>
      ventasDelPeriodo
        .filter((v) => Number(v.ESTATUS) === 1)
        .reduce((sum, v) => sum + (Number(v.TOTAL) || 0), 0),
    [ventasDelPeriodo],
  );

  const cantidadAnteriores = totalAnteriores;

  // ── Imprimir corte ─────────────────────────────────────────────────────
  const imprimirCorte = async (tipo) => {
    setModalCorte(false);
    setImprimiendoCorte(true);
    try {
      const datos = await VentasDatabase.getDatosCorte();
      if (tipo === "RESUMEN") {
        await imprimirCorteResumen(datos);
      } else {
        await imprimirCorteGeneral(datos);
      }
    } catch (e) {
      console.error("Error al imprimir corte:", e);
      mostrarAviso({
        type: "danger",
        title: "Error",
        message: "No se pudo imprimir el corte.",
      });
    } finally {
      setImprimiendoCorte(false);
    }
  };

  // ── Seleccionar todo / ninguno ────────────────────────────────────────
  const todoSeleccionado =
    ventasFiltradasState.length > 0 &&
    ventasFiltradasState.every((v) => v.seleccionado);

  const toggleSeleccionarTodo = () => {
    const nuevoValor = !todoSeleccionado;
    const idsVistual = new Set(
      ventasFiltradasState.map((v) => Number(v.ID)),
    );
    setVentas((prev) =>
      prev.map((v) =>
        idsVistual.has(Number(v.ID))
          ? { ...v, seleccionado: nuevoValor }
          : v,
      ),
    );
  };

  // Limpiar no depende de la selección: borra del dispositivo todas las
  // ventas ya sincronizadas y finalizadas; las pendientes se quedan.
  const solicitarLimpiarVentas = async () => {
    let idsAEliminar = [];
    try {
      idsAEliminar = await VentasDatabase.getIdsLimpiables();
    } catch (e) {
      console.error("Error buscando ventas para limpiar:", e);
    }

    if (!idsAEliminar.length) {
      setModalNoBorrar(true);
      return;
    }

    idsALimpiarRef.current = idsAEliminar;
    setCantidadALimpiar(idsAEliminar.length);
    setModalConfirmLimpiar(true);
  };

  const cancelarLimpiarVentas = () => {
    setModalConfirmLimpiar(false);
    setCantidadALimpiar(0);
    idsALimpiarRef.current = [];
  };

  const confirmarLimpiarVentas = () => {
    setModalConfirmLimpiar(false);
    setModalNip(true);
  };

  const limpiarVentas = async () => {
    const idsAEliminar = idsALimpiarRef.current;
    if (!idsAEliminar?.length) {
      setModalNip(false);
      setModalNoBorrar(true);
      return;
    }

    try {
      await VentasDatabase.eliminarVentas(idsAEliminar);
      const idsSet = new Set(idsAEliminar.map((id) => Number(id)));
      setVentas((prev) =>
        prev.filter((v) => !idsSet.has(Number(v.ID))),
      );
      // Recalcular conteo y totales de Anteriores desde SQL.
      setRecarga((n) => n + 1);
      idsALimpiarRef.current = [];
      setCantidadALimpiar(0);
    } catch (e) {
      console.error("Error eliminando ventas:", e);
      setAviso({
        type: "danger",
        title: "Error",
        message:
          "No se pudieron eliminar las ventas seleccionadas. Intenta de nuevo.",
      });
    } finally {
      setModalNip(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: tema.background }}
    >
      {/* ----------- header ----------- */}
      <HeaderBar style={s.header}>
        <RecoverButton />
        {/* ----------- seleccionar todo ----------- */}
        {ventasFiltradasState.length > 0 && (
          <View style={{}}>
            <Button
              style={[
                s.ButtonFiltro,

                todoSeleccionado && {
                  flex: undefined,
                  borderColor: gb.purple500,
                  backgroundColor: gb.purple550,
                },
              ]}
              styleContainer={{
                height: normalize(32),
                paddingHorizontal: 0,
                flex: undefined,
              }}
              onPress={toggleSeleccionarTodo}
            >
              <View
                style={[s.buttonContent, { paddingHorizontal: normalize(4) }]}
              >
                <Ionicons
                  name={todoSeleccionado ? "checkbox" : "square-outline"}
                  size={normalize(14)}
                  color={todoSeleccionado ? gb.gray50 : "#4F5FE0"}
                />
                <Text
                  style={{
                    color: todoSeleccionado ? gb.gray50 : "#4F5FE0",
                    fontSize: normalize(12),
                  }}
                >
                  {todoSeleccionado ? "Deseleccionar todo" : "Seleccionar todo"}
                </Text>
              </View>
            </Button>
          </View>
        )}

        <Button style={s.btnLimpiar} onPress={solicitarLimpiarVentas}>
          <Ionicons name="cloud-done-outline" size={normalize(14)} color="#4F5FE0" />
          <Text style={s.btnLimpiarText}>Limpiar sincronizadas</Text>
        </Button>
      </HeaderBar>

      {/* ----------- filtros ----------- */}
      <View style={s.filtrosWrapper}>
        <View style={s.filtrosPeriodo}>
          {[
            { label: "Hoy", icono: "today-outline" },
            { label: "Anteriores", icono: "calendar-outline" },
          ].map(({ label, icono }) => {
            const activo = filtroPeriodo === label;
            const extra =
              label === "Anteriores" && cantidadAnteriores > 0
                ? ` (${cantidadAnteriores})`
                : "";
            return (
              <Button
                key={label}
                style={[s.segmento, activo && s.segmentoActivo]}
                styleContainer={s.segmentoContainer}
                onPress={() => setFiltroPeriodo(label)}
              >
                <View style={s.buttonContent}>
                  <Ionicons
                    name={icono}
                    size={normalize(14)}
                    color={activo ? "#4F5FE0" : "#8A93B2"}
                  />
                  <Text style={activo ? s.segmentoTextoActivo : s.segmentoTexto}>
                    {label}
                    {extra}
                  </Text>
                </View>
              </Button>
            );
          })}
        </View>

        <View style={s.filtros}>
          {[
            { label: "Todas", icono: "list" },
            { label: "Pendientes", icono: "wallet-outline" },
            { label: "Canceladas", icono: "close-circle-outline" },
          ].map(({ label, icono }) => {
            const activo = filtroSeleccionado === label;
            return (
              <Button
                key={label}
                style={[s.chip, activo && s.chipActivo]}
                styleContainer={s.chipContainer}
                onPress={() => setFiltroSeleccionado(label)}
              >
                <View style={s.buttonContent}>
                  <Ionicons
                    name={icono}
                    size={normalize(13)}
                    color={activo ? "#FFFFFF" : "#5B6488"}
                  />
                  <Text style={activo ? s.chipTextoActivo : s.chipTexto}>
                    {label}
                  </Text>
                </View>
              </Button>
            );
          })}
        </View>

        <View style={s.totalesContainer}>
          <View style={s.totalTarjeta}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="cash-outline"
                size={normalize(16)}
                color="#18A058"
                style={{ marginRight: normalize(5) }}
              />
              <Text style={s.precio}>
                {formatTotal(
                  filtroPeriodo === "Anteriores"
                    ? resumenAnteriores.efectivo
                    : totalFiltrado,
                )}
              </Text>
            </View>
            <Text style={s.descripcion}>
              {filtroPeriodo === "Hoy"
                ? "Efectivo de hoy"
                : "Efectivo anteriores"}
            </Text>
          </View>
          <View style={s.totalTarjeta}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="trending-up"
                size={normalize(16)}
                color="#4F5FE0"
                style={{ marginRight: normalize(5) }}
              />
              <Text style={s.precio}>
                {formatTotal(
                  filtroPeriodo === "Anteriores"
                    ? resumenAnteriores.total
                    : totalGeneral,
                )}
              </Text>
            </View>
            <Text style={s.descripcion}>
              {filtroPeriodo === "Hoy"
                ? "Total de hoy"
                : "Total anteriores"}
            </Text>
          </View>
        </View>
      </View>

      {/* ----------- lista de ventas ----------- */}
      <View style={[s.scroll, { flex: 1, backgroundColor: gb.gray50 }]}>
        {ventasFiltradasState.length > 0 && (
          <View style={s.leyendaColores}>
            <View style={s.leyendaItem}>
              <View
                style={[s.leyendaMuestra, { backgroundColor: tema.successSoft }]}
              />
              <Text style={s.leyendaTexto}>Al día</Text>
            </View>
            <View style={s.leyendaItem}>
              <LinearGradient
                colors={["#F5D9A8", "#FFF4E0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.leyendaMuestra}
              />
              <Text style={s.leyendaTexto}>Ventas por sincronizar</Text>
            </View>
          </View>
        )}
        <View style={s.container}>
          {cargando ? (
            <ActivityIndicator
              size="large"
              color={gb.purple550}
              style={{ marginTop: normalize(40) }}
            />
          ) : errorCarga ? (
            <View
              style={{
                alignItems: "center",
                marginTop: normalize(40),
                paddingHorizontal: normalize(20),
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={normalize(50)}
                color="#E5484D"
              />
              <Text
                style={{
                  color: "#E5484D",
                  marginTop: normalize(12),
                  fontSize: normalize(12),
                  textAlign: "center",
                }}
              >
                {errorCarga}
              </Text>
            </View>
          ) : ventasFiltradasState.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: normalize(40) }}>
              <Ionicons
                name="receipt-outline"
                size={normalize(60)}
                color={gb.gray300}
              />
              <Text
                style={{
                  color: gb.gray400,
                  marginTop: normalize(12),
                  fontSize: normalize(14),
                  textAlign: "center",
                  paddingHorizontal: normalize(20),
                }}
              >
                {filtroPeriodo === "Hoy"
                  ? "No hay ventas de hoy"
                  : "No hay ventas de días anteriores"}
                {filtroSeleccionado !== "Todas"
                  ? ` (${filtroSeleccionado.toLowerCase()})`
                  : ""}
                .
              </Text>
            </View>
          ) : (
            <FlatList
              style={[s.ventasContainer, { flex: 1 }]}
              contentContainerStyle={{
                gap: normalize(10),
                paddingBottom: normalize(20),
              }}
              data={ventasFiltradasState}
              keyExtractor={(venta) => String(venta.ID)}
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={7}
              removeClippedSubviews
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (filtroPeriodo === "Anteriores") cargarMasAnteriores();
              }}
              ListFooterComponent={
                cargandoMas ? (
                  <ActivityIndicator
                    color={gb.purple550}
                    style={{ marginVertical: normalize(16) }}
                  />
                ) : null
              }
              renderItem={({ item: venta }) => {
                const descuentoTotal =
                  (Number(venta.DESCUENTO_COMANDA) || 0) +
                  (Number(venta.DESCUENTO_ARTICULOS) || 0);
                return (
                  <CardVenta
                    key={venta.ID}
                    ficha={String(venta.FICHA ?? venta.ID)}
                    mesa={
                      String(venta.ORIGEN || "").toUpperCase() === "ONLINE"
                        ? venta.TIPO_ENTREGA === "delivery"
                          ? "Pedido en línea · Delivery"
                          : "Pedido en línea · Recoger"
                        : (venta.MESA_NOMBRE ?? "Mesa")
                    }
                    total={formatTotal(venta.TOTAL)}
                    productos={venta.NUM_ARTICULOS ?? 0}
                    fecha={formatFecha(venta.FECHA)}
                    status={estatusTexto(venta.ESTATUS)}
                    sincronizado={ventaEstaSincronizada(venta)}
                    seleccionado={venta.seleccionado}
                    idComanda={venta.ID}
                    descuento={descuentoTotal}
                    cuentaDividida={Number(venta.PARTES_CUENTA_DIVIDIDA) > 0}
                    esPedidoEnLinea={
                      String(venta.ORIGEN || "").toUpperCase() === "ONLINE"
                    }
                    onSeleccionar={(valor) => {
                      setVentas((prev) =>
                        prev.map((v) =>
                          Number(v.ID) === Number(venta.ID)
                            ? { ...v, seleccionado: valor }
                            : v,
                        ),
                      );
                    }}
                  />
                );
              }}
            />
          )}
        </View>
      </View>

      {/* ----------- footer ----------- */}
      <SincronizadoFooter
        onSincronizar={async () => {
          if (sincronizando) return;

          const idsSeleccionados = ventas
            .filter((v) => v.seleccionado)
            .map((v) => v.ID);

          if (idsSeleccionados.length === 0) {
            mostrarAviso({
              type: "warning",
              title: "Sincronización",
              message: "Selecciona al menos una venta para sincronizar.",
            });
            return;
          }

          const hayInternet = await verificarConexionInternet();
          if (!hayInternet) {
            mostrarAviso({
              type: "warning",
              title: "Sin conexión",
              message: MENSAJE_SIN_INTERNET,
            });
            return;
          }

          setSincronizando(true);
          try {
            const { sincronizadas } =
              await integracionVentas.sincronizarVentas(idsSeleccionados, {
                devolverVentas: false,
              });
            setRecarga((n) => n + 1);
            if (sincronizadas === 0) {
              mostrarAviso({
                type: "warning",
                title: "Sincronización",
                message:
                  "Las ventas seleccionadas no están pendientes de sincronizar.",
              });
            } else {
              mostrarAviso({
                type: "info",
                title: "Sincronización exitosa",
                message:
                  sincronizadas === 1
                    ? "La venta se sincronizó correctamente."
                    : `${sincronizadas} ventas se sincronizaron correctamente.`,
              });
            }
          } catch (e) {
            mostrarAviso({
              type: "warning",
              title: "Sincronización",
              message: obtenerMensajeErrorRed(e, MENSAJE_NO_SE_PUDO_CONECTAR),
            });
          } finally {
            setSincronizando(false);
          }
        }}
        sincronizando={sincronizando}
        onActualizar={() => setModalCorte(true)}
      />

      {/* ----------- modal tipo de corte ----------- */}
      <GeneralModal
        visible={modalCorte}
        onRequestClose={() => setModalCorte(false)}
      >
        <View style={s.modalContainer}>
          <LinearGradient
            style={s.modalIconContainer}
            colors={[gb.blue550, gb.blue400]}
          >
            <Ionicons name="print" size={normalize(40)} color="#FFFFFF" />
          </LinearGradient>
          <Text style={s.modalTitle}>¿Qué desea imprimir?</Text>
          <View
            style={{
              flexDirection: "row",
              gap: normalize(10),
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              onPress={() => imprimirCorte("RESUMEN")}
              style={[s.modalButton, { flex: 1, backgroundColor: gb.blue550 }]}
            >
              <Text style={[s.modalButtonText, { color: "#FFFFFF" }]}>
                Resumen
              </Text>
            </Button>
            <Button
              onPress={() => imprimirCorte("GENERAL")}
              style={[
                s.modalButton,
                { flex: 1, backgroundColor: gb.purple550 },
              ]}
            >
              <Text style={[s.modalButtonText, { color: "#FFFFFF" }]}>
                General
              </Text>
            </Button>
          </View>
        </View>
      </GeneralModal>

      {/* ----------- nip modal acceso ----------- */}
      <NipModal
        visible={modalAcceso}
        titulo="Acceso a ventas"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={onAccesoCorrecto}
        onClose={onAccesoCancelado}
      />

      {/* ----------- nip modal ----------- */}

      <NipModal
        visible={modalNip}
        titulo="Limpiar Ventas"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={limpiarVentas}
        onClose={() => setModalNip(false)}
      />

      {/* ----------- modal no borrar ----------- */}
      <GeneralModal
        visible={modalNoBorrar}
        onRequestClose={() => setModalNoBorrar(false)}
      >
        <View style={s.modalContainer}>
          <LinearGradient
            style={s.modalIconContainer}
            colors={[gb.yellow500, gb.yellow300]}
          >
            <Ionicons name="warning" size={normalize(40)} color="#FFFFFF" />
          </LinearGradient>
          <Text style={s.modalTitle}>
            No hay ventas sincronizadas para limpiar. Las ventas pendientes de
            pago o de sincronizar se quedan en la tablet hasta subirlas.
          </Text>
          <Button onPress={() => setModalNoBorrar(false)} style={s.modalButton}>
            <Text style={s.modalButtonText}>Aceptar</Text>
          </Button>
        </View>
      </GeneralModal>

      <ModalWarning
        visible={modalConfirmLimpiar}
        type="warning"
        title="¿Limpiar ventas sincronizadas?"
        message={
          cantidadALimpiar === 1
            ? "Se quitará de esta tablet 1 venta que ya está guardada en el servidor. Sigue disponible en el panel web. Las ventas pendientes de sincronizar no se tocan."
            : `Se quitarán de esta tablet ${cantidadALimpiar} ventas que ya están guardadas en el servidor. Siguen disponibles en el panel web. Las ventas pendientes de sincronizar no se tocan.`
        }
        confirmText="Continuar"
        cancelText="Cancelar"
        onCancel={cancelarLimpiarVentas}
        onConfirm={confirmarLimpiarVentas}
      />

      <ModalWarning
        visible={!!aviso}
        type={aviso?.type ?? "warning"}
        title={aviso?.title ?? ""}
        message={aviso?.message ?? ""}
        confirmText="Entendido"
        cancelText="Cerrar"
        onCancel={() => setAviso(null)}
        onConfirm={() => setAviso(null)}
      />
    </SafeAreaView>
  );
};

export default Ventas;
