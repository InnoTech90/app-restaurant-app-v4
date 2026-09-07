import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import CardVenta from "../../../components/Molecules/CardVenta/CardVenta";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import { dataBase } from "../../../components/Molecules/NipModal/database";
import SincronizadoFooter from "../../../components/Molecules/SincronizadoFooter/SincronizadoFooter";
import {
  autorizarVentas,
  tieneAccesoVentas,
} from "../../../utils/sectionAccess";
import {
  esErrorDeConexion,
  MENSAJE_SIN_INTERNET,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import VentasDatabase from "./database";
import { integracionVentas } from "./integracion";
import { s } from "./styles";
import { imprimirCorteGeneral, imprimirCorteResumen } from "./ticket";

// Convierte ESTATUS numérico a la cadena que muestra la UI
const estatusTexto = (estatus) => {
  if (estatus === 1) return "Pagado";
  if (estatus === 2) return "Cancelado";
  if (estatus === 3) return "Pendiente";
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

const Ventas = () => {
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("Todas");
  const [modalNip, setModalNip] = useState(false);
  const [modalAcceso, setModalAcceso] = useState(false);
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [modalNoBorrar, setModalNoBorrar] = useState(false);
  const [modalCorte, setModalCorte] = useState(false);
  const [imprimiendoCorte, setImprimiendoCorte] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [ventas, setVentas] = useState([]);
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
          const data = await VentasDatabase.getVentas();
          if (activo) {
            // Agregar campo seleccionado para el checkbox de limpiar
            setVentas(data.map((v) => ({ ...v, seleccionado: false })));
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
    }, [accesoPermitido]),
  );
  const ventasFiltradasState = useMemo(() => {
    if (filtroSeleccionado === "Pendientes")
      return ventas.filter((v) => v.ESTATUS === 3);
    if (filtroSeleccionado === "Canceladas")
      return ventas.filter((v) => v.ESTATUS === 2);
    return ventas;
  }, [ventas, filtroSeleccionado]);

  // ── Totales ────────────────────────────────────────────────────────────
  // "Total filtrado" = ventas pagadas EN EFECTIVO (ESTATUS=1, FORMATO_PAGO contiene "efectivo")
  const totalFiltrado = useMemo(
    () =>
      ventas
        .filter(
          (v) =>
            v.ESTATUS === 1 &&
            (v.FORMATO_PAGO ?? "").toLowerCase().includes("efectivo"),
        )
        .reduce((sum, v) => sum + (v.TOTAL ?? 0), 0),
    [ventas],
  );
  // "Total general" = todas las ventas pagadas (ESTATUS=1), sin pendientes ni canceladas
  const totalGeneral = useMemo(
    () =>
      ventas
        .filter((v) => v.ESTATUS === 1)
        .reduce((sum, v) => sum + (v.TOTAL ?? 0), 0),
    [ventas],
  );

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
      Alert.alert("Error", "No se pudo imprimir el corte.");
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
    const idsVistual = new Set(ventasFiltradasState.map((v) => v.ID));
    setVentas((prev) =>
      prev.map((v) =>
        idsVistual.has(v.ID) ? { ...v, seleccionado: nuevoValor } : v,
      ),
    );
  };

  // ── Limpiar ventas ────────────────────────────────────────────────────
  const limpiarVentas = async () => {
    // Solo se eliminan las seleccionadas que además estén sincronizadas y no sean pendientes.
    // Las seleccionadas no sincronizadas simplemente se ignoran (no se eliminan).
    const hayElegibles = ventasFiltradasState.some(
      (v) => v.seleccionado && !!v.SINCRONIZADO && v.ESTATUS !== 3,
    );
    if (!hayElegibles) {
      setModalNoBorrar(true);
      setModalNip(false);
      return;
    }
    const idsAEliminar = ventasFiltradasState
      .filter((v) => v.seleccionado && !!v.SINCRONIZADO && v.ESTATUS !== 3)
      .map((v) => v.ID);

    try {
      await VentasDatabase.eliminarVentas(idsAEliminar);
      setVentas((prev) => prev.filter((v) => !idsAEliminar.includes(v.ID)));
    } catch (e) {
      console.error("Error eliminando ventas:", e);
      Alert.alert(
        "Error",
        "No se pudieron eliminar las ventas seleccionadas. Intenta de nuevo.",
      );
    } finally {
      setModalNip(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {/* ----------- header ----------- */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
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
                  color={todoSeleccionado ? gb.gray50 : gb.purple100}
                />
                <Text
                  style={{
                    color: todoSeleccionado ? gb.gray50 : gb.gray50,
                    fontSize: normalize(12),
                  }}
                >
                  {todoSeleccionado ? "Deseleccionar todo" : "Seleccionar todo"}
                </Text>
              </View>
            </Button>
          </View>
        )}

        <Button style={s.btnLimpiar} onPress={() => setModalNip(true)}>
          <Ionicons name="trash" size={normalize(14)} color={gb.gray50} />
          <Text style={s.btnLimpiarText}>Limpiar Ventas</Text>
        </Button>
      </LinearGradient>

      {/* ----------- filtros ----------- */}
      <View
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
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
                style={[s.ButtonFiltro, activo && s.botonFiltroSeleccionado]}
                styleText={activo ? { color: gb.gray50 } : {}}
                styleContainer={s.buttonCOntainer}
                onPress={() => setFiltroSeleccionado(label)}
              >
                <View style={s.buttonContent}>
                  <Ionicons
                    name={icono}
                    size={normalize(14)}
                    color={activo ? gb.gray50 : gb.purple550}
                  />
                  <Text style={{ color: activo ? gb.gray50 : gb.gray400 }}>
                    {label}
                  </Text>
                </View>
              </Button>
            );
          })}
        </View>

        {/* ----------- totales ----------- */}
        <View style={s.totalesContainer}>
          <LinearGradient
            colors={["#2196F3", "#42A5F5"]}
            style={s.totalFiltrado}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="cash"
                size={normalize(18)}
                color={gb.gray50}
                style={{ marginRight: normalize(5) }}
              />
              <Text style={s.precio}>{formatTotal(totalFiltrado)}</Text>
            </View>
            <Text style={s.descripcion}>Total efectivo</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#FF9800", "#FFB74D"]}
            style={s.totalFiltrado}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="trending-up"
                size={normalize(18)}
                color={gb.gray50}
                style={{ marginRight: normalize(5) }}
              />
              <Text style={s.precio}>{formatTotal(totalGeneral)}</Text>
            </View>
            <Text style={s.descripcion}>Total general</Text>
          </LinearGradient>
        </View>
      </View>

      {/* ----------- lista de ventas ----------- */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: gb.gray50 }}
        style={s.scroll}
      >
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
                color="#F44336"
              />
              <Text
                style={{
                  color: "#F44336",
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
                }}
              >
                No hay ventas
                {filtroSeleccionado !== "Todas"
                  ? ` ${filtroSeleccionado.toLowerCase()}`
                  : ""}
                .
              </Text>
            </View>
          ) : (
            <ScrollView
              style={s.ventasContainer}
              contentContainerStyle={{
                gap: normalize(10),
                paddingBottom: normalize(20),
              }}
            >
              {ventasFiltradasState.map((venta) => (
                <CardVenta
                  key={venta.ID}
                  ficha={String(venta.FICHA ?? venta.ID)}
                  mesa={venta.MESA_NOMBRE ?? "Mesa"}
                  total={formatTotal(venta.TOTAL)}
                  productos={venta.NUM_ARTICULOS ?? 0}
                  fecha={formatFecha(venta.FECHA)}
                  status={estatusTexto(venta.ESTATUS)}
                  sincronizado={!!venta.SINCRONIZADO}
                  seleccionado={venta.seleccionado}
                  idComanda={venta.ID}
                  onSeleccionar={(valor) => {
                    setVentas((prev) =>
                      prev.map((v) =>
                        v.ID === venta.ID ? { ...v, seleccionado: valor } : v,
                      ),
                    );
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* ----------- footer ----------- */}
      <SincronizadoFooter
        onSincronizar={async () => {
          if (sincronizando) return;

          const idsSeleccionados = ventas
            .filter((v) => v.seleccionado)
            .map((v) => v.ID);

          if (idsSeleccionados.length === 0) {
            Alert.alert(
              "Sincronización",
              "Selecciona al menos una venta para sincronizar.",
            );
            return;
          }

          const hayInternet = await verificarConexionInternet();
          if (!hayInternet) {
            Alert.alert("Sin conexión", MENSAJE_SIN_INTERNET);
            return;
          }

          setSincronizando(true);
          try {
            const { sincronizadas, ventas: ventasActualizadas } =
              await integracionVentas.sincronizarVentas(idsSeleccionados);
            setVentas(
              ventasActualizadas.map((v) => ({ ...v, seleccionado: false })),
            );
            if (sincronizadas === 0) {
              Alert.alert(
                "Sincronización",
                "Las ventas seleccionadas no están pendientes de sincronizar.",
              );
            } else {
              Alert.alert(
                "Sincronización exitosa",
                sincronizadas === 1
                  ? "La venta se sincronizó correctamente."
                  : `${sincronizadas} ventas se sincronizaron correctamente.`,
              );
            }
          } catch (e) {
            if (esErrorDeConexion(e)) {
              Alert.alert("Sin conexión", MENSAJE_SIN_INTERNET);
            } else {
              console.error("Error sincronizando ventas:", e);
              Alert.alert(
                "Error",
                "No se pudieron sincronizar las ventas. Intenta de nuevo.",
              );
            }
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
            <Ionicons name="print" size={normalize(40)} color={gb.gray50} />
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
              <Text style={[s.modalButtonText, { color: gb.gray50 }]}>
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
              <Text style={[s.modalButtonText, { color: gb.gray50 }]}>
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
        onSubmit={onAccesoCorrecto}
        onClose={onAccesoCancelado}
      />

      {/* ----------- nip modal ----------- */}

      <NipModal
        visible={modalNip}
        titulo="Limpiar Ventas"
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
            <Ionicons name="warning" size={normalize(40)} color={gb.gray50} />
          </LinearGradient>
          <Text style={s.modalTitle}>
            Solo se pueden limpiar ventas sincronizadas que estén pagadas o
            canceladas
          </Text>
          <Button onPress={() => setModalNoBorrar(false)} style={s.modalButton}>
            <Text style={s.modalButtonText}>Aceptar</Text>
          </Button>
        </View>
      </GeneralModal>
    </SafeAreaView>
  );
};

export default Ventas;
