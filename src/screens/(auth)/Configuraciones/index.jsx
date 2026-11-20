import { Ionicons } from "@expo/vector-icons";
import HeaderBar from "../../../components/atoms/HeaderBar/HeaderBar";
import { LinearGradient } from "../../../components/atoms/FondoSolido/FondoSolido";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import ConfigItem from "../../../components/atoms/ConfigItem/ConfigItem";
import InputToggle from "../../../components/atoms/InputToggle/InputToggle";
import Select from "../../../components/atoms/Select/Select";
import ModalWarning from "../../../components/Molecules/ModalWarning/ModalWarning";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import {
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import { clearLocalTables, resetLocalData } from "../../../utils/db";
import { notifyDigitalOrdersCapabilityChanged } from "../../../utils/digitalOrders/badgeStore";
import {
  construirMensajePendientes,
  hayPendientesParaSincronizacionGeneral,
  obtenerPendientesSincronizacion,
} from "../../../utils/pendientesSincronizacion";
import {
  autorizarSeccion,
  tieneAccesoSeccion,
} from "../../../utils/sectionAccess";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { integracionPantallaDeCarga } from "../PantallaDeCarga/integracion";
import Database from "./database";
import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { s } from "./styles";
import { cambiarApariencia, preferenciaApariencia } from "../../../utils/apariencia";
import { color as tema } from "../../../utils/theme";

// ─────────────────────────────────────────────────────────────────────────────
//  Encabezado de sección con degradado
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ titulo, iconName, color }) => {
  const gradientColor = color || gb.blue550;

  return (
    <View style={[s.seccionHeader, s.seccionHeaderModerno]}>
      <View style={[s.seccionIcono, { backgroundColor: gradientColor + "1A" }]}>
        <Ionicons name={iconName} size={normalize(15)} color={gradientColor} />
      </View>
      <Text style={[s.seccionTitulo, s.seccionTituloModerno]}>{titulo}</Text>
    </View>
  );
};

// Selector de apariencia (Sistema / Claro / Oscuro). Cambiarlo reinicia la
// interfaz porque los estilos se calculan al arrancar.
const OPCIONES_APARIENCIA = [
  { valor: "sistema", texto: "Sistema", icono: "phone-portrait-outline" },
  { valor: "claro", texto: "Claro", icono: "sunny-outline" },
  { valor: "oscuro", texto: "Oscuro", icono: "moon-outline" },
];

const SelectorApariencia = () => (
  <View style={s.aparienciaFila}>
    {OPCIONES_APARIENCIA.map((op) => {
      const activa = preferenciaApariencia === op.valor;
      return (
        <Pressable
          key={op.valor}
          onPress={() => !activa && cambiarApariencia(op.valor)}
          style={[s.aparienciaOpcion, activa && s.aparienciaOpcionActiva]}
          accessibilityRole="button"
          accessibilityState={{ selected: activa }}
        >
          <Ionicons
            name={op.icono}
            size={normalize(16)}
            color={activa ? tema.textOnPrimary : tema.textSecondary}
          />
          <Text style={[s.aparienciaTexto, activa && s.aparienciaTextoActiva]}>
            {op.texto}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Configuraciones() {
  const contextoAutenticacion = useContext(AuthContext);
  const [cargando, setCargando] = useState(true);
  const [config, setConfig] = useState(null);
  const [formatosPago, setFormatosPago] = useState([]);
  const [tamañoFuentes, setTamañoFuentes] = useState([]);
  const [modalNipGeneral, setModalNipGeneral] = useState(false);
  const [modalConfirmSync, setModalConfirmSync] = useState(false);
  const [modalConfirmReinicio, setModalConfirmReinicio] = useState(false);
  const [sincronizandoGeneral, setSincronizandoGeneral] = useState(false);
  const [reiniciandoDatos, setReiniciandoDatos] = useState(false);
  const [aviso, setAviso] = useState(null);
  const debounceRef = useRef({});

  const [nipModal, setNipModal] = useState({
    visible: false,
    titulo: "",
    accion: null,
  });
  const [finanzasDesbloqueada, setFinanzasDesbloqueada] = useState(false);

  const cerrarAviso = useCallback(() => setAviso(null), []);

  const mostrarAviso = useCallback((type, title, message) => {
    setAviso({ type, title, message });
  }, []);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        try {
          await Database.runMigraciones();
          const [cfg, fp, tf] = await Promise.all([
            Database.getConfiguraciones(),
            Database.getFormatosPago(),
            Database.getTamañoFuentes(),
          ]);
          setConfig(cfg ?? {});
          setFormatosPago(fp.map((f) => ({ label: f.NOMBRE, value: f.ID })));
          setTamañoFuentes(tf.map((f) => ({ label: f.NOMBRE, value: f.ID })));
        } finally {
          setCargando(false);
        }
      }
      cargar();
    }, []),
  );

  // ── Abierto a pedidos: igual que "Recibe pedidos" del panel (User) ───────
  // Lo confirma el servidor; solo un dispositivo por sucursal puede recibir
  // pedidos en línea. Si no se puede, se explica en un mensaje.
  const [cambiandoPedidos, setCambiandoPedidos] = useState(false);
  const cambiarAbiertoPedidos = async (abrir) => {
    if (cambiandoPedidos) return;
    if (!(await verificarConexionInternet())) {
      mostrarAviso("warning", "Sin conexión", "Para abrir o cerrar los pedidos en línea se necesita internet.");
      return;
    }
    setCambiandoPedidos(true);
    try {
      const headers = await getDeviceAuthHeaders();
      const res = await deviceApi.patch(
        "/devices/receives-orders",
        { flagReceivesOrders: abrir },
        { headers },
      );
      const confirmado = !!res?.data?.device?.flagReceivesOrders;
      await Database.setAbiertoPedidos(confirmado);
      setConfig((prev) => ({ ...prev, ABIERTO_PEDIDOS: confirmado ? 1 : 0 }));
      notifyDigitalOrdersCapabilityChanged();
      mostrarAviso(
        "info",
        confirmado ? "Pedidos en línea abiertos" : "Pedidos en línea cerrados",
        confirmado
          ? "Este dispositivo recibirá los pedidos en línea de la sucursal."
          : "Este dispositivo ya no recibirá pedidos en línea.",
      );
    } catch (error) {
      const raw = String(error?.response?.data?.message ?? "");
      const status = error?.response?.status;
      if (status === 409 || raw.includes("Only one device per branch")) {
        const otro = raw.match(/configured: "([^"]+)"/)?.[1];
        mostrarAviso(
          "warning",
          "No se pueden abrir los pedidos aquí",
          `Solo un dispositivo por sucursal puede recibir pedidos en línea${
            otro ? ` y ahora los recibe "${otro}"` : ""
          }. Desactívalo en ese dispositivo o en el panel (Dispositivos asociados) y vuelve a intentar.`,
        );
      } else if (status === 404 || status === 401) {
        // Un servidor sin esta función manda la petición a otra ruta
        // (PATCH /devices/:id, solo para el panel) y responde 401 o 404.
        mostrarAviso("warning", "Servidor sin actualizar", "El servidor todavía no tiene esta función. Inténtalo cuando se actualice.");
      } else {
        mostrarAviso("danger", "No se pudo cambiar", obtenerMensajeErrorRed(error, "No se pudo cambiar la recepción de pedidos. Inténtalo de nuevo."));
      }
    } finally {
      setCambiandoPedidos(false);
    }
  };

  const pedirNip = (titulo, accion) => {
    setNipModal({ visible: true, titulo, accion });
  };

  const cerrarNipModal = () => {
    setNipModal({ visible: false, titulo: "", accion: null });
  };

  const onNipCorrecto = async () => {
    const accion = nipModal.accion;
    cerrarNipModal();
    if (accion) await accion();
  };

  useEffect(() => {
    if (!config) return;

    if (!config.MODO_RESTRICTIVO || tieneAccesoSeccion("finanzas")) {
      setFinanzasDesbloqueada(true);
    } else {
      setFinanzasDesbloqueada(false);
    }
  }, [config?.MODO_RESTRICTIVO, config]);

  const desbloquearFinanzas = () => {
    pedirNip("Finanzas", () => {
      autorizarSeccion("finanzas");
      setFinanzasDesbloqueada(true);
    });
  };

  const CAMPOS_PROTEGIDOS = new Set([
    "PROTEGER_VENTAS",
    "NIP_FINALIZAR_TICKET",
    "MODO_RESTRICTIVO",
    "HABILITAR_EDICION_TICKET",
  ]);

  const TITULOS_NIP = {
    PROTEGER_VENTAS: "Proteger acceso a ventas",
    NIP_FINALIZAR_TICKET: "NIP para finalizar venta",
    MODO_RESTRICTIVO: "Modo restrictivo",
    HABILITAR_EDICION_TICKET: "Restringir edición de ticket",
  };

  // ── Guardar inmediato (Switch, Select) ────────────────────────────────────
  const guardar = useCallback((campo, valor) => {
    const actualizar = () => {
      setConfig((prev) => ({
        ...prev,
        [campo]: valor,
      }));

      Database.updateConfiguracion(campo, valor).catch(console.error);
    };

    if (CAMPOS_PROTEGIDOS.has(campo)) {
      pedirNip(TITULOS_NIP[campo] ?? campo, actualizar);
      return;
    }

    actualizar();
  }, []);

  // ── Guardar con debounce 600 ms (inputs numéricos) ────────────────────────
  const guardarDebounce = useCallback((campo, texto) => {
    setConfig((prev) => ({ ...prev, [campo]: texto }));
    clearTimeout(debounceRef.current[campo]);
    debounceRef.current[campo] = setTimeout(() => {
      const valor = parseFloat(texto) || 0;
      Database.updateConfiguracion(campo, valor).catch(console.error);
    }, 600);
  }, []);

  const prepararSincronizacion = useCallback(async () => {
    setModalNipGeneral(false);

    const hayInternet = await verificarConexionInternet();
    if (!hayInternet) {
      mostrarAviso("warning", "Sin conexión", MENSAJE_SIN_INTERNET);
      return;
    }

    try {
      const pendientes = await obtenerPendientesSincronizacion();

      if (hayPendientesParaSincronizacionGeneral(pendientes)) {
        mostrarAviso(
          "warning",
          "Sincronizaciones pendientes",
          construirMensajePendientes(pendientes),
        );
        return;
      }

      setModalConfirmSync(true);
    } catch (error) {
      console.error("Error verificando pendientes:", error);
      mostrarAviso(
        "danger",
        "Error",
        "No se pudo verificar si hay datos pendientes de sincronizar.",
      );
    }
  }, [mostrarAviso]);

  const ejecutarSincronizacion = useCallback(async () => {
    setModalConfirmSync(false);
    setSincronizandoGeneral(true);

    try {
      await clearLocalTables();
      await integracionPantallaDeCarga.initializeDatabase();
      const generalData = await integracionPantallaDeCarga.general();
      await Promise.all([
        integracionPantallaDeCarga.table(),
        integracionPantallaDeCarga.clientes(),
        integracionPantallaDeCarga.inventory(),
        integracionPantallaDeCarga.menu(),
      ]);
      await integracionPantallaDeCarga.configuraciones(generalData);
      await integracionPantallaDeCarga.historialCaja();
      await integracionPantallaDeCarga.comandaTable();

      const [cfg, fp, tf] = await Promise.all([
        Database.getConfiguraciones(),
        Database.getFormatosPago(),
        Database.getTamañoFuentes(),
      ]);
      setConfig(cfg ?? {});
      setFormatosPago(fp.map((f) => ({ label: f.NOMBRE, value: f.ID })));
      setTamañoFuentes(tf.map((f) => ({ label: f.NOMBRE, value: f.ID })));
      notifyDigitalOrdersCapabilityChanged();

      mostrarAviso(
        "info",
        "Sincronización completa",
        "Se limpiaron los datos locales y se descargó nuevamente la información general.",
      );
    } catch (error) {
      console.error("Error sincronizando datos generales:", error);
      mostrarAviso(
        "danger",
        "Error de sincronización",
        obtenerMensajeErrorRed(
          error,
          "No se pudo actualizar la información. Inténtalo más tarde.",
        ),
      );
    } finally {
      setSincronizandoGeneral(false);
    }
  }, [mostrarAviso]);

  const ejecutarReinicioDatos = useCallback(async () => {
    setModalConfirmReinicio(false);
    setReiniciandoDatos(true);
    try {
      await resetLocalData();
      contextoAutenticacion.desautenticar();
    } catch (error) {
      console.error("Error eliminando datos locales:", error);
      mostrarAviso(
        "danger",
        "Error",
        "No se pudieron eliminar los datos locales.",
      );
    } finally {
      setReiniciandoDatos(false);
    }
  }, [contextoAutenticacion, mostrarAviso]);

  if (cargando || !config) {
    return (
      <SafeAreaView style={s.root}>
        <HeaderBar style={s.header}>
          <Text style={s.headerTitulo}>Configuraciones</Text>
        </HeaderBar>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={["bottom"]}>
      {/* Header */}
      <HeaderBar style={s.header}>
        <Text style={s.headerTitulo}>Ajustes del dispositivo</Text>
      </HeaderBar>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* ── General ───────────────────────────────────────────────── */}
        <View style={s.seccion}>
          <SectionHeader
            titulo="General"
            iconName="settings-outline"
            color={gb.blue550}
          />

          <ConfigItem
            icon="phone-portrait-outline"
            titulo="Nombre del dispositivo"
            subtitulo="Registrado en tu red de sucursal"
          >
            <TextInput
              value={config.NOMBRE_DISPOCITIVO ?? ""}
              editable={false}
              style={s.inputNombre}
            />
          </ConfigItem>

          <ConfigItem
            icon="storefront-outline"
            titulo="Abierto a pedidos"
            subtitulo="Recibir los pedidos en línea de la sucursal en este dispositivo"
            border={false}
          >
            {cambiandoPedidos ? (
              <ActivityIndicator color={gb.blue550} />
            ) : (
              <Switch
                value={Number(config.ABIERTO_PEDIDOS) === 1}
                onValueChange={(v) =>
                  pedirNip(v ? "Abrir pedidos en línea" : "Cerrar pedidos en línea", () =>
                    cambiarAbiertoPedidos(v),
                  )
                }
                trackColor={{ false: gb.gray200, true: gb.blue550 }}
                thumbColor="#FFFFFF"
              />
            )}
          </ConfigItem>
        </View>

        {/* ── Apariencia ────────────────────────────────────────────── */}
        <View style={s.seccion}>
          <SectionHeader
            titulo="Apariencia"
            iconName="contrast-outline"
            color={gb.blue550}
          />
          <View style={s.aparienciaCuerpo}>
            <Text style={s.aparienciaAyuda}>
              Elige el modo de color. "Sistema" usa el del dispositivo. Al
              cambiarlo la app se reinicia unos segundos.
            </Text>
            <SelectorApariencia />
          </View>
        </View>

        {/* ── Impresión ─────────────────────────────────────────────── */}
        <View style={s.seccion}>
          <SectionHeader
            titulo="Impresión"
            iconName="print-outline"
            color={gb.purple550}
          />

          <ConfigItem
            icon="receipt-outline"
            iconColor={gb.purple550}
            titulo="Imprimir ficha automáticamente"
            subtitulo="Imprime al agregar un artículo nuevo"
          >
            <Switch
              value={!!config.IMPRIMIR_FICHA}
              onValueChange={(v) => guardar("IMPRIMIR_FICHA", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.purple550 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>

          <ConfigItem
            icon="refresh-outline"
            iconColor={gb.purple550}
            titulo="Solo productos nuevos"
            subtitulo="En la comanda, al imprimir de nuevo solo salen los artículos que aún no se han impreso"
          >
            <Switch
              value={!!config.SOLO_PRODUCTOS_NUEVOS}
              onValueChange={(v) => guardar("SOLO_PRODUCTOS_NUEVOS", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.purple550 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>

          <ConfigItem
            icon="text-outline"
            iconColor={gb.purple550}
            titulo="Tamaño de letra en ticket"
            subtitulo="Ajusta el tamaño del texto impreso"
            border={false}
          >
            <Select
              options={tamañoFuentes}
              value={config.ID_TAMAÑO_FUENTE}
              onChange={(v) => guardar("ID_TAMAÑO_FUENTE", v)}
              style={s.selectInline}
            />
          </ConfigItem>
        </View>

        {/* ── Finanzas ──────────────────────────────────────────────── */}
        <View style={s.seccion}>
          <SectionHeader
            titulo="Finanzas"
            iconName="cash-outline"
            color={gb.green600}
          />

          {config.MODO_RESTRICTIVO && !finanzasDesbloqueada ? (
            <ConfigItem
              icon="lock-closed-outline"
              iconColor={gb.green600}
              titulo="Sección protegida"
              subtitulo="Ingresa tu NIP para ver y editar la configuración de finanzas"
              border={false}
            >
              <Button onPress={desbloquearFinanzas} style={s.syncButton}>
                <Text style={s.syncButtonText}>Desbloquear</Text>
              </Button>
            </ConfigItem>
          ) : (
            <>
              <ConfigItem
                icon="car-outline"
                iconColor={gb.green600}
                titulo="Costo de envío"
                subtitulo="Se aplica al total de la comanda"
              >
                <InputToggle
                  value={String(config.COSTO_ENVIO ?? "0")}
                  esPct={!!config.COSTO_ENVIO_ES_PCT}
                  onChangeValue={(v) => guardarDebounce("COSTO_ENVIO", v)}
                  onToggle={() =>
                    guardar(
                      "COSTO_ENVIO_ES_PCT",
                      config.COSTO_ENVIO_ES_PCT ? 0 : 1,
                    )
                  }
                />
              </ConfigItem>

              <ConfigItem
                icon="pie-chart-outline"
                iconColor={gb.green600}
                titulo="Impuestos"
                subtitulo="Porcentaje o monto fijo por comanda"
              >
                <InputToggle
                  value={String(config.IMPUESTOS ?? "0")}
                  esPct={!!config.IMPUESTOS_ES_PCT}
                  onChangeValue={(v) => guardarDebounce("IMPUESTOS", v)}
                  onToggle={() =>
                    guardar("IMPUESTOS_ES_PCT", config.IMPUESTOS_ES_PCT ? 0 : 1)
                  }
                />
              </ConfigItem>

              <ConfigItem
                icon="pricetag-outline"
                iconColor={gb.green600}
                titulo="Descuentos"
                subtitulo="Descuento predeterminado al crear una comanda"
              >
                <InputToggle
                  value={String(config.DESCUENTOS ?? "0")}
                  esPct={!!config.DESCUENTOS_ES_PCT}
                  onChangeValue={(v) => guardarDebounce("DESCUENTOS", v)}
                  onToggle={() =>
                    guardar(
                      "DESCUENTOS_ES_PCT",
                      config.DESCUENTOS_ES_PCT ? 0 : 1,
                    )
                  }
                />
              </ConfigItem>

              <ConfigItem
                icon="card-outline"
                iconColor={gb.green600}
                titulo="Forma de pago predeterminada"
                subtitulo="Método de cobro sugerido al cerrar comanda"
                border={false}
              >
                <Select
                  options={formatosPago}
                  value={config.ID_FORMATO_PAGO}
                  onChange={(v) => guardar("ID_FORMATO_PAGO", v)}
                  style={s.selectInline}
                />
              </ConfigItem>
            </>
          )}
        </View>

        {/* ── Seguridad ─────────────────────────────────────────────── */}
        <View style={s.seccion}>
          <SectionHeader
            titulo="Seguridad"
            iconName="lock-closed-outline"
            color={gb.red600}
          />

          <ConfigItem
            icon="eye-off-outline"
            iconColor={gb.red600}
            titulo="Proteger acceso a ventas"
            subtitulo="Requiere NIP para ver el historial de ventas"
          >
            <Switch
              value={!!config.PROTEGER_VENTAS}
              onValueChange={(v) => guardar("PROTEGER_VENTAS", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>

          <ConfigItem
            icon="keypad-outline"
            iconColor={gb.red600}
            titulo="NIP para finalizar venta"
            subtitulo="Solicita NIP antes de cobrar o finalizar una comanda"
          >
            <Switch
              value={Number(config.NIP_FINALIZAR_TICKET ?? 1) === 1}
              onValueChange={(v) => guardar("NIP_FINALIZAR_TICKET", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>

          <ConfigItem
            icon="create-outline"
            iconColor={gb.red600}
            titulo="Restringir edición de ticket"
            subtitulo="Si está activo, pide NIP en cualquier cambio de la comanda (productos, complementos, descuentos, etc.). Si está desactivado, permite editar sin NIP."
          >
            <Switch
              value={
                config.HABILITAR_EDICION_TICKET != null &&
                Number(config.HABILITAR_EDICION_TICKET) === 0
              }
              onValueChange={(v) =>
                guardar("HABILITAR_EDICION_TICKET", v ? 0 : 1)
              }
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>

          <ConfigItem
            icon="shield-checkmark-outline"
            iconColor={gb.red600}
            titulo="Modo restrictivo"
            subtitulo="Con el modo activo, Caja, Mi restaurante, Gastos, Inventarios, Configuraciones, Editar cuenta y el adicional de pago piden NIP y el permiso del gerente. Si está apagado, no pide NIP, pero sin permiso no deja entrar."
            border={false}
          >
            <Switch
              value={!!config.MODO_RESTRICTIVO}
              onValueChange={(v) => guardar("MODO_RESTRICTIVO", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>
        </View>

        <View style={s.seccion}>
          <SectionHeader
            titulo="Inicio del día"
            iconName="sunny-outline"
            color={gb.yellow500}
          />

          <ConfigItem
            icon="notifications-outline"
            iconColor={gb.yellow500}
            titulo="Bienvenida al iniciar el día"
            subtitulo="Al abrir la app en un día nuevo, muestra un aviso con pendientes del día anterior (sincronizar, caja, comandas, limpiar ventas)."
            border={false}
          >
            <Switch
              value={Number(config.BIENVENIDA_INICIO_DIA ?? 1) === 1}
              onValueChange={(v) => guardar("BIENVENIDA_INICIO_DIA", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.yellow500 }}
              thumbColor="#FFFFFF"
            />
          </ConfigItem>
        </View>

        {/* ── Sincronización general ─────────────────────────────────────── */}
        <View style={s.seccion}>
          <SectionHeader
            titulo="Sincronización"
            iconName="cloud-download-outline"
            color={gb.orange600}
          />

          <View style={s.syncPanel}>
            <Text style={s.syncTitle}>Actualizar toda la data</Text>
            <Text style={s.syncSubtitle}>
              Si no hay datos pendientes de sincronizar, limpia la base local y
              vuelve a descargar información general, mesas, clientes,
              inventario y menú.
            </Text>

            <Button
              onPress={() => setModalNipGeneral(true)}
              style={[
                s.syncButton,
                sincronizandoGeneral && s.syncButtonDisabled,
              ]}
              styleContainer={s.syncButtonContainer}
              disabled={sincronizandoGeneral}
            >
              <Text style={s.syncButtonText}>
                {sincronizandoGeneral
                  ? "Sincronizando..."
                  : "Sincronizar ahora"}
              </Text>
            </Button>

            {__DEV__ && (
              <Button
                onPress={() => setModalConfirmReinicio(true)}
                style={s.syncButton}
                styleContainer={s.syncButtonContainer}
                disabled={sincronizandoGeneral || reiniciandoDatos}
              >
                <Text style={s.syncButtonText}>
                  {reiniciandoDatos
                    ? "Borrando datos..."
                    : "Borrar datos locales"}
                </Text>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      <NipModal
        visible={modalNipGeneral}
        onClose={() => setModalNipGeneral(false)}
        titulo="Sincronizar app"
        modo="acceso"
        keywords={["settings"]}
        onSubmit={prepararSincronizacion}
      />
      <NipModal
        visible={nipModal.visible}
        titulo={nipModal.titulo}
        modo="acceso"
        keywords={["settings"]}
        onClose={cerrarNipModal}
        onSubmit={onNipCorrecto}
      />

      <ModalWarning
        visible={modalConfirmSync}
        type="warning"
        title="¿Sincronizar ahora?"
        message="Se limpiará toda la base de datos local y se volverán a descargar los datos generales, mesas, clientes, inventario y menú. Esta acción no se puede deshacer."
        confirmText="Sincronizar"
        cancelText="Cancelar"
        onCancel={() => setModalConfirmSync(false)}
        onConfirm={ejecutarSincronizacion}
      />

      {__DEV__ && (
        <ModalWarning
          visible={modalConfirmReinicio}
          type="danger"
          title="Borrar datos locales"
          message="Se eliminarán mesas, menú, clientes, comandas, ventas, inventario y configuraciones de este dispositivo. Después tendrás que iniciar sesión nuevamente."
          confirmText="Borrar todo"
          cancelText="Cancelar"
          onCancel={() => setModalConfirmReinicio(false)}
          onConfirm={ejecutarReinicioDatos}
        />
      )}

      <ModalWarning
        visible={!!aviso}
        type={aviso?.type ?? "info"}
        title={aviso?.title ?? ""}
        message={aviso?.message ?? ""}
        confirmText="Entendido"
        cancelText="Cerrar"
        onCancel={cerrarAviso}
        onConfirm={cerrarAviso}
      />

      <Modal
        visible={sincronizandoGeneral || reiniciandoDatos}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={s.blockingOverlay}>
          <View style={s.blockingCard}>
            <ActivityIndicator size="large" color={gb.blue550} />
            <Text style={s.blockingTitle}>
              {reiniciandoDatos ? "Borrando datos..." : "Sincronizando..."}
            </Text>
            <Text style={s.blockingSubtitle}>
              Espera un momento. No cierres ni uses la app.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
