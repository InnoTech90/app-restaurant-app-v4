import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { BluetoothManager, isBluetoothEscposDisponible, MENSAJE_BT_NO_DISPONIBLE } from "../../../utils/bluetoothEscpos";

import { SafeAreaView } from "react-native-safe-area-context";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { verificarConexionInternet } from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { initializeSchema } from "../../../utils/db";
import {
  listColumns,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { integracionPantallaDeCarga } from "../PantallaDeCarga/integracion";
import { Database } from "./Database";
import {
  liberarConexionBT,
  sleep,
  solicitarPermisosBluetooth,
} from "./Funciones/Impresion";
import s from "./styles";
import { handleTest } from "./templates/TicketDePrueba";

// Caché de dispositivos emparejados — no guardar listas vacías para permitir reintentos.
let _pairedDevicesCache = null;

// ─────────────────────────────────────────────────────────────────────────────
//  Subcomponente: tarjeta de punto de impresión
// ─────────────────────────────────────────────────────────────────────────────
const PrinterCard = ({
  item,
  onVincular,
  onDesvincular,
  onTest,
  vinculando,
}) => {
  const linked = !!item.ID_IMPRESORA;
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        {/* Icono */}
        <View style={[s.iconBox, linked && s.iconBoxLinked]}>
          <Ionicons
            name="print"
            size={normalize(24)}
            color={linked ? gb.green500 : gb.blue550}
          />
        </View>

        {/* Info */}
        <View style={s.cardInfo}>
          <Text style={s.cardNombre}>{item.NOMBRE}</Text>
          <View style={s.statusRow}>
            <View
              style={[
                s.statusDot,
                { backgroundColor: linked ? gb.green500 : gb.gray400 },
              ]}
            />
            <Text
              style={[
                s.statusText,
                { color: linked ? gb.green500 : gb.gray400 },
              ]}
            >
              {linked ? "Vinculada" : "Sin vincular"}
            </Text>
          </View>
          {linked && (
            <Text style={s.macText} numberOfLines={1}>
              {item.ID_IMPRESORA}
            </Text>
          )}
        </View>
      </View>

      {/* Acciones */}
      <View style={s.cardActions}>
        {linked ? (
          <>
            <Pressable style={s.btnTest} onPress={() => onTest(item)}>
              <Ionicons
                name="checkmark-circle"
                size={normalize(13)}
                color="white"
              />
              <Text style={s.btnText}>Prueba</Text>
            </Pressable>
            <Pressable
              style={s.btnDesvincular}
              onPress={() => onDesvincular(item)}
            >
              <Ionicons name="unlink" size={normalize(13)} color="white" />
              <Text style={s.btnText}>Desvincular</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[s.btnVincular, vinculando && { opacity: 0.6 }]}
            onPress={() => onVincular(item)}
            disabled={vinculando}
          >
            <Ionicons name="bluetooth" size={normalize(13)} color="white" />
            <Text style={s.btnText}>Vincular</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Subcomponente: ítem de dispositivo Bluetooth
// ─────────────────────────────────────────────────────────────────────────────
const DeviceItem = ({ device, onConnect, connecting }) => (
  <View style={s.deviceItem}>
    <View style={s.deviceIconBox}>
      <Ionicons name="bluetooth" size={normalize(18)} color={gb.blue550} />
    </View>
    <View style={s.deviceInfo}>
      <Text style={s.deviceName}>
        {device.name || "Dispositivo sin nombre"}
      </Text>
      <Text style={s.deviceAddress}>{device.address}</Text>
    </View>
    <Pressable
      style={[s.deviceConnectBtn, connecting && { opacity: 0.5 }]}
      onPress={() => onConnect(device)}
      disabled={connecting}
    >
      <Text style={s.deviceConnectText}>Conectar</Text>
    </Pressable>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
const Impresoras = () => {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Modal Bluetooth
  const [modalBT, setModalBT] = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDevices, setFoundDevices] = useState([]);
  const [conectando, setConectando] = useState(false);
  const puntoSeleccionadoRef = useRef(null);

  const cargarPuntosDesdeApi = useCallback(async () => {
    const hayInternet = await verificarConexionInternet();
    if (!hayInternet) return false;

    try {
      await integracionPantallaDeCarga.general();
      return true;
    } catch (e) {
      console.warn(
        "[Impresoras] No se pudieron actualizar puntos desde API:",
        e,
      );
      return false;
    }
  }, []);

  // ── Carga inicial ────────────────────────────────────────────────────────
  const cargarPuntos = useCallback(
    async ({ mostrarLoader = true } = {}) => {
      try {
        if (mostrarLoader) setCargando(true);

        await initializeSchema();
        let data = await Database.getPuntosImpresion();

        if (data.length === 0) {
          const sincronizado = await cargarPuntosDesdeApi();
          if (sincronizado) {
            data = await Database.getPuntosImpresion();
          }
        }

        if (data.length === 0) {
          const idSucursal = await Database.getSucursalId();
          await Database.asegurarPuntoCaja(idSucursal);
          data = await Database.getPuntosImpresion();
        }

        setPuntos(data);
      } catch (e) {
        console.error("[Impresoras] Error cargando puntos:", e);
        Alert.alert("Error", "No se pudieron cargar los puntos de impresión.");
      } finally {
        if (mostrarLoader) setCargando(false);
      }
    },
    [cargarPuntosDesdeApi],
  );

  useEffect(() => {
    cargarPuntos();
  }, [cargarPuntos]);

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    try {
      await cargarPuntosDesdeApi();
      await cargarPuntos({ mostrarLoader: false });
    } finally {
      setRefrescando(false);
    }
  }, [cargarPuntos, cargarPuntosDesdeApi]);

  // ── Abrir modal: cargar dispositivos emparejados (rápido, sin scan) ──────
  const handleVincular = async (punto) => {
    if (Platform.OS !== "android") {
      Alert.alert(
        "No disponible",
        "La vinculación Bluetooth solo está disponible en Android.",
      );
      return;
    }

    puntoSeleccionadoRef.current = punto;
    setModalBT(true);
    await cargarEmparejados();
  };

  const parsePairedDevices = (rawList) => {
    const paired = [];
    if (rawList && rawList.length > 0) {
      for (let i = 0; i < rawList.length; i++) {
        try {
          paired.push(JSON.parse(rawList[i]));
        } catch {
          // ignorar entradas mal formadas
        }
      }
    }
    return paired;
  };

  // Solo lee los dispositivos ya emparejados en Android (instantáneo).
  const cargarEmparejados = async (forzar = false) => {
    if (
      !forzar &&
      _pairedDevicesCache !== null &&
      _pairedDevicesCache.length > 0
    ) {
      setPairedDevices(_pairedDevicesCache);
      setFoundDevices([]);
      return;
    }

    try {
      setEscaneando(true);

      if (!isBluetoothEscposDisponible()) {
        Alert.alert("Bluetooth no disponible", MENSAJE_BT_NO_DISPONIBLE);
        return;
      }

      const permisosOk = await solicitarPermisosBluetooth();
      if (!permisosOk) {
        Alert.alert(
          "Permisos requeridos",
          "Se necesitan permisos de Bluetooth y ubicación para buscar impresoras.",
        );
        return;
      }

      const r = await BluetoothManager.enableBluetooth();
      const paired = parsePairedDevices(r);

      if (paired.length > 0) {
        _pairedDevicesCache = paired;
      } else {
        _pairedDevicesCache = null;
      }

      setPairedDevices(paired);
      setFoundDevices([]);
    } catch (e) {
      console.error("[Impresoras] enableBluetooth falló:", e);
      _pairedDevicesCache = null;
      setPairedDevices([]);
      setFoundDevices([]);
    } finally {
      setEscaneando(false);
    }
  };

  // Scan completo (discovery) — solo bajo demanda con el botón
  const escanearDispositivos = async () => {
    try {
      setEscaneando(true);
      _pairedDevicesCache = null;

      if (!isBluetoothEscposDisponible()) {
        Alert.alert("Bluetooth no disponible", MENSAJE_BT_NO_DISPONIBLE);
        return;
      }

      await liberarConexionBT();
      await sleep(400);

      const permisosOk = await solicitarPermisosBluetooth();
      if (!permisosOk) {
        Alert.alert(
          "Permisos requeridos",
          "Se necesitan permisos de Bluetooth y ubicación para buscar impresoras.",
        );
        return;
      }

      await BluetoothManager.enableBluetooth();

      const scanResult = await BluetoothManager.scanDevices();
      const ss = JSON.parse(scanResult);
      const paired = ss.paired || [];
      const found = ss.found || [];

      if (paired.length > 0) {
        _pairedDevicesCache = paired;
      } else {
        _pairedDevicesCache = null;
      }

      setPairedDevices(paired);
      setFoundDevices(found);

      await Database.guardarDispositivosBluetooth(paired, found).catch(
        () => {},
      );
    } catch (e) {
      console.error("[Impresoras] scanDevices falló:", e);
      Alert.alert(
        "Error",
        "No se pudo escanear dispositivos Bluetooth. Verifica que el Bluetooth esté encendido.",
      );
    } finally {
      setEscaneando(false);
    }
  };

  // ── Conectar y guardar ────────────────────────────────────────────────────
  const handleConectar = async (device) => {
    if (!puntoSeleccionadoRef.current) return;
    try {
      setConectando(true);
      // Solo guardar la MAC — no se necesita abrir conexión RFCOMM para vincular.
      // Conectarse aquí agota el stack BT de Android al vincular varias impresoras.
      await Database.vincularImpresora(
        puntoSeleccionadoRef.current.ID,
        device.address,
      );
    } catch (e) {
      console.error("[Impresoras] vincularImpresora falló:", e);
      Alert.alert("Error", "No se pudo guardar la vinculación.");
      setConectando(false);
      return;
    }

    // Guardado exitoso — cerrar modal y refrescar lista.
    // cargarPuntos() va fuera del try para que un error de lectura
    // no se confunda con un error de vinculación.
    const nombrePunto = puntoSeleccionadoRef.current.NOMBRE;
    const nombreDispositivo = device.name || device.address;
    setModalBT(false);
    setConectando(false);
    await cargarPuntos().catch(() => {});
    Alert.alert(
      "Vinculada",
      `Impresora "${nombreDispositivo}" vinculada a "${nombrePunto}".`,
    );
  };

  // ── Desvincular ──────────────────────────────────────────────────────────
  const handleDesvincular = (punto) => {
    Alert.alert(
      "Desvincular impresora",
      `¿Desvincular la impresora de "${punto.NOMBRE}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desvincular",
          style: "destructive",
          onPress: async () => {
            try {
              await Database.desvincularImpresora(punto.ID);
              await cargarPuntos();
            } catch {
              Alert.alert("Error", "No se pudo desvincular la impresora.");
            }
          },
        },
      ],
    );
  };

  // ── Renderizado ──────────────────────────────────────────────────────────
  const allDevices = [
    ...pairedDevices.map((d) => ({ ...d, _tipo: "Emparejado" })),
    ...foundDevices.map((d) => ({ ...d, _tipo: "Encontrado" })),
  ];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <Text style={s.headerTitle}>Impresoras</Text>
        <Pressable
          onPress={cargarPuntos}
          style={{
            width: normalize(40),
            height: normalize(40),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="refresh" size={normalize(20)} color="white" />
        </Pressable>
      </LinearGradient>

      {/* ── Lista de puntos de impresión ─────────────────────────────── */}
      {cargando ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gb.gray50,
          }}
        >
          <ActivityIndicator size="large" color={gb.blue550} />
        </View>
      ) : (
        <FlatList
          data={puntos}
          keyExtractor={(item) => String(item.ID)}
          numColumns={listColumns}
          key={`impresoras-${listColumns}`}
          columnWrapperStyle={
            listColumns > 1
              ? {
                  gap: normalize(12),
                  alignItems: "stretch",
                  marginBottom: normalize(4),
                }
              : undefined
          }
          contentContainerStyle={[
            s.listContent,
            puntos.length === 0 && { flexGrow: 1 },
          ]}
          style={{ flex: 1, backgroundColor: gb.gray50 }}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              colors={[gb.blue550]}
            />
          }
          renderItem={({ item }) => (
            <View
              style={listColumns > 1 ? { flex: 1, minWidth: 0 } : undefined}
            >
              <PrinterCard
                item={item}
                onVincular={handleVincular}
                onDesvincular={handleDesvincular}
                onTest={handleTest}
                vinculando={conectando}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Ionicons
                name="print-outline"
                size={normalize(60)}
                color={gb.gray300}
              />
              <Text style={s.emptyText}>
                No hay puntos de impresión configurados.{"\n"}
                Desliza hacia abajo para actualizar desde el servidor.
              </Text>
            </View>
          }
        />
      )}

      {/* ── Modal Bluetooth ──────────────────────────────────────────── */}
      <GeneralModal
        visible={modalBT}
        onRequestClose={() => setModalBT(false)}
        headerTitle="Dispositivos Bluetooth"
        headerColorGrandien={gb.gradient_blue}
        iconCloseColor="white"
        headerColorText="white"
      >
        <View style={s.modalBody}>
          {escaneando && (
            <View style={s.scanningRow}>
              <ActivityIndicator size="small" color={gb.blue550} />
              <Text style={s.scanningText}>Buscando dispositivos...</Text>
            </View>
          )}

          {!escaneando && allDevices.length === 0 && (
            <Text style={s.noDevicesText}>
              No se encontraron dispositivos.{"\n"}
              Empareja la impresora en Ajustes → Bluetooth de Android{"\n"}o usa
              el botón de abajo para buscar.
            </Text>
          )}

          {pairedDevices.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Emparejados</Text>
              {pairedDevices.map((d) => (
                <DeviceItem
                  key={d.address}
                  device={d}
                  onConnect={handleConectar}
                  connecting={conectando}
                />
              ))}
            </>
          )}

          {foundDevices.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Encontrados</Text>
              {foundDevices.map((d) => (
                <DeviceItem
                  key={d.address}
                  device={d}
                  onConnect={handleConectar}
                  connecting={conectando}
                />
              ))}
            </>
          )}

          {/* Botón re-escanear */}
          <Pressable
            style={[s.scanBtn, escaneando && { opacity: 0.6 }]}
            onPress={escanearDispositivos}
            disabled={escaneando}
          >
            <Ionicons name="search" size={normalize(16)} color="white" />
            <Text style={s.scanBtnText}>
              {escaneando ? "Buscando..." : "Buscar dispositivos"}
            </Text>
          </Pressable>

          {!escaneando && pairedDevices.length === 0 && (
            <Pressable
              style={[
                s.scanBtn,
                { backgroundColor: gb.gray500, marginTop: normalize(6) },
              ]}
              onPress={() => cargarEmparejados(true)}
            >
              <Ionicons name="refresh" size={normalize(16)} color="white" />
              <Text style={s.scanBtnText}>Recargar emparejados</Text>
            </Pressable>
          )}
        </View>
      </GeneralModal>
    </SafeAreaView>
  );
};

export default Impresoras;
