import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import ConfigItem from "../../../components/atoms/ConfigItem/ConfigItem";
import InputToggle from "../../../components/atoms/InputToggle/InputToggle";
import Select from "../../../components/atoms/Select/Select";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import {
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import { resetLocalData } from "../../../utils/db";
import {
  autorizarSeccion,
  tieneAccesoSeccion,
} from "../../../utils/sectionAccess";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { integracionPantallaDeCarga } from "../PantallaDeCarga/integracion";
import Database from "./database";
import { s } from "./styles";

// ─────────────────────────────────────────────────────────────────────────────
//  Encabezado de sección con degradado
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ titulo, iconName, color }) => {
  const gradientColor = color || gb.blue550;

  return (
    <LinearGradient
      colors={[gradientColor, gradientColor + "CC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={s.seccionHeader}
    >
      <Ionicons name={iconName} size={normalize(15)} color={gb.gray50} />
      <Text style={s.seccionTitulo}>{titulo}</Text>
    </LinearGradient>
  );
};

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
  const [sincronizandoGeneral, setSincronizandoGeneral] = useState(false);
  const [reiniciandoDatos, setReiniciandoDatos] = useState(false);
  const debounceRef = useRef({});

  const [nipModal, setNipModal] = useState({
    visible: false,
    titulo: "",
    accion: null,
  });
  const [finanzasDesbloqueada, setFinanzasDesbloqueada] = useState(false);

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
    NIP_FINALIZAR_TICKET: "NIP para finalizar ticket",
    MODO_RESTRICTIVO: "Modo restrictivo",
    HABILITAR_EDICION_TICKET: "Habilitar edición de ticket",
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

  const sincronizarDatosGenerales = useCallback(async () => {
    const hayInternet = await verificarConexionInternet();
    if (!hayInternet) {
      Alert.alert("Sin conexión", MENSAJE_SIN_INTERNET);
      return;
    }

    setSincronizandoGeneral(true);
    try {
      await integracionPantallaDeCarga.initializeDatabase();
      const generalData = await integracionPantallaDeCarga.general();
      await Promise.all([
        integracionPantallaDeCarga.table(),
        integracionPantallaDeCarga.clientes(),
        integracionPantallaDeCarga.inventory(),
        integracionPantallaDeCarga.menu(),
      ]);
      await integracionPantallaDeCarga.configuraciones(generalData);

      Alert.alert(
        "Sincronización completa",
        "La información general se actualizó correctamente.",
      );
    } catch (error) {
      console.error("Error sincronizando datos generales:", error);
      Alert.alert(
        "Error de sincronización",
        obtenerMensajeErrorRed(
          error,
          "No se pudo actualizar la información. Intenta nuevamente.",
        ),
      );
    } finally {
      setSincronizandoGeneral(false);
      setModalNipGeneral(false);
    }
  }, []);

  const confirmarReinicioDatos = useCallback(() => {
    Alert.alert(
      "Borrar datos locales",
      "Se eliminarán mesas, menú, clientes, comandas, ventas, inventario y configuraciones de este dispositivo. Después tendrás que iniciar sesión nuevamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: async () => {
            setReiniciandoDatos(true);
            try {
              await resetLocalData();
              contextoAutenticacion.desautenticar();
            } catch (error) {
              console.error("Error eliminando datos locales:", error);
              Alert.alert(
                "Error",
                "No se pudieron eliminar los datos locales.",
              );
            } finally {
              setReiniciandoDatos(false);
            }
          },
        },
      ],
    );
  }, [contextoAutenticacion]);

  if (cargando || !config) {
    return (
      <SafeAreaView style={s.root}>
        <LinearGradient
          colors={gb.gradient_blue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.header}
        >
          <Text style={s.headerTitulo}>Configuraciones</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={["bottom"]}>
      {/* Header */}
      <LinearGradient
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.header}
      >
        <Text style={s.headerTitulo}>Configuraciones</Text>
      </LinearGradient>

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
            subtitulo="Permite recibir órdenes desde otros dispositivos"
            border={false}
          >
            <Switch
              value={!!config.ABIERTO_PEDIDOS}
              onValueChange={(v) => guardar("ABIERTO_PEDIDOS", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.blue550 }}
              thumbColor={gb.gray50}
            />
          </ConfigItem>
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
              thumbColor={gb.gray50}
            />
          </ConfigItem>

          <ConfigItem
            icon="refresh-outline"
            iconColor={gb.purple550}
            titulo="Solo productos nuevos"
            subtitulo="Al reimprimir, solo incluye artículos no impresos aún"
          >
            <Switch
              value={!!config.SOLO_PRODUCTOS_NUEVOS}
              onValueChange={(v) => guardar("SOLO_PRODUCTOS_NUEVOS", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.purple550 }}
              thumbColor={gb.gray50}
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
              thumbColor={gb.gray50}
            />
          </ConfigItem>

          <ConfigItem
            icon="keypad-outline"
            iconColor={gb.red600}
            titulo="NIP para finalizar ticket"
            subtitulo="Solicita NIP antes de cobrar una comanda"
          >
            <Switch
              value={!!config.NIP_FINALIZAR_TICKET}
              onValueChange={(v) => guardar("NIP_FINALIZAR_TICKET", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor={gb.gray50}
            />
          </ConfigItem>

          <ConfigItem
            icon="create-outline"
            iconColor={gb.red600}
            titulo="Habilitar edición de ticket"
            subtitulo="Si está activo, permite editar la comanda sin NIP. Si está desactivado, pide NIP en cualquier cambio (productos, complementos, descuentos, etc.)"
          >
            <Switch
              value={!!config.HABILITAR_EDICION_TICKET}
              onValueChange={(v) =>
                guardar("HABILITAR_EDICION_TICKET", v ? 1 : 0)
              }
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor={gb.gray50}
            />
          </ConfigItem>

          <ConfigItem
            icon="shield-checkmark-outline"
            iconColor={gb.red600}
            titulo="Modo restrictivo"
            subtitulo="Limita funciones avanzadas en este dispositivo"
            border={false}
          >
            <Switch
              value={!!config.MODO_RESTRICTIVO}
              onValueChange={(v) => guardar("MODO_RESTRICTIVO", v ? 1 : 0)}
              trackColor={{ false: gb.gray200, true: gb.red600 }}
              thumbColor={gb.gray50}
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
              Descarga información general, mesas, clientes, inventario y menú
              desde el servidor.
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

            <Button
              onPress={confirmarReinicioDatos}
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
          </View>
        </View>
      </ScrollView>

      <NipModal
        visible={modalNipGeneral}
        onClose={() => setModalNipGeneral(false)}
        titulo="Sincronizar app"
        onSubmit={sincronizarDatosGenerales}
      />
      <NipModal
        visible={nipModal.visible}
        titulo={nipModal.titulo}
        onClose={cerrarNipModal}
        onSubmit={onNipCorrecto}
      />
    </SafeAreaView>
  );
}
