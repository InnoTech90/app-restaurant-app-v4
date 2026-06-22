import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    Text,
    View
} from "react-native";
// import {
//     BluetoothEscposPrinter,
//     BluetoothManager,
// } from "react-native-bluetooth-escpos-printer";
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';

import { SafeAreaView } from "react-native-safe-area-context";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { listColumns, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./Database";
import {
    liberarConexionBT,
    sleep,
    solicitarPermisosBluetooth
} from "./Funciones/Impresion";
import s from "./styles";
import { handleTest } from "./templates/TicketDePrueba";

// Caché de nivel de módulo — sobrevive re-renders y re-mounts del componente.
let _pairedDevicesCache = null;

// ─────────────────────────────────────────────────────────────────────────────
//  Subcomponente: tarjeta de punto de impresión
// ─────────────────────────────────────────────────────────────────────────────
const PrinterCard = ({ item, onVincular, onDesvincular, onTest, vinculando }) => {
    const linked = !!item.ID_IMPRESORA;
    return (
        <View style={s.card}>
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

            {/* Acciones */}
            <View style={s.cardActions}>
                {linked ? (
                    <>
                        <Pressable
                            style={s.btnTest}
                            onPress={() => onTest(item)}
                        >
                            <Ionicons name="checkmark-circle" size={normalize(13)} color="white" />
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
            <Text style={s.deviceName}>{device.name || "Dispositivo sin nombre"}</Text>
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

    // Modal Bluetooth
    const [modalBT, setModalBT] = useState(false);
    const [escaneando, setEscaneando] = useState(false);
    const [pairedDevices, setPairedDevices] = useState([]);
    const [foundDevices, setFoundDevices] = useState([]);
    const [conectando, setConectando] = useState(false);
    const puntoSeleccionadoRef = useRef(null);

    // ── Carga inicial ────────────────────────────────────────────────────────
    const cargarPuntos = useCallback(async () => {
        try {
            setCargando(true);
            const data = await Database.getPuntosImpresion();
            setPuntos(data);
        } catch (e) {
            Alert.alert("Error", "No se pudieron cargar los puntos de impresión.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarPuntos();
    }, [cargarPuntos]);

    // ── Abrir modal: cargar dispositivos emparejados (rápido, sin scan) ──────
    const handleVincular = async (punto) => {
        puntoSeleccionadoRef.current = punto;
        setModalBT(true);
        await cargarEmparejados();
    };

    // Solo lee los dispositivos ya emparejados en Android (instantáneo).
    // Usa caché de módulo para no llamar enableBluetooth() más de una vez.
    const cargarEmparejados = async () => {
        // Usar caché si ya está disponible (sobrevive re-mounts)
        if (_pairedDevicesCache !== null) {
            setPairedDevices(_pairedDevicesCache);
            setFoundDevices([]);
            return;
        }

        try {
            setEscaneando(true);

            const permisosOk = await solicitarPermisosBluetooth();
            if (!permisosOk) {
                Alert.alert(
                    "Permisos requeridos",
                    "Se necesitan permisos de Bluetooth para buscar impresoras."
                );
                return;
            }

            const r = await BluetoothManager.enableBluetooth();
            const paired = [];
            if (r && r.length > 0) {
                for (let i = 0; i < r.length; i++) {
                    try { paired.push(JSON.parse(r[i])); } catch {}
                }
            }
            _pairedDevicesCache = paired;
            setPairedDevices(paired);
            setFoundDevices([]);
        } catch (e) {
            console.error('[Impresoras] enableBluetooth falló:', e);
            // No mostrar alert — mostrar lista vacía para que el usuario
            // pueda intentar el scan manual con el botón "Buscar nuevos"
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

            await liberarConexionBT();
            await sleep(400);

            const permisosOk = await solicitarPermisosBluetooth();
            if (!permisosOk) return;

            await BluetoothManager.enableBluetooth();

            const s = await BluetoothManager.scanDevices();
            const ss = JSON.parse(s);
            const paired = ss.paired || [];
            const found = ss.found || [];
            _pairedDevicesCache = paired;
            setPairedDevices(paired);
            setFoundDevices(found);
        } catch (e) {
            Alert.alert("Error", "No se pudo escanear dispositivos Bluetooth.");
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
                device.address
            );
        } catch (e) {
            console.error('[Impresoras] vincularImpresora falló:', e);
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
        Alert.alert("Vinculada", `Impresora "${nombreDispositivo}" vinculada a "${nombrePunto}".`);
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
            ]
        );
    };

  

    // ── Renderizado ──────────────────────────────────────────────────────────
    const allDevices = [
        ...pairedDevices.map((d) => ({ ...d, _tipo: "Emparejado" })),
        ...foundDevices.map((d) => ({ ...d, _tipo: "Encontrado" })),
    ];

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
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
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: gb.gray50 }}>
                    <ActivityIndicator size="large" color={gb.blue550} />
                </View>
            ) : (
                <FlatList
                    data={puntos}
                    keyExtractor={(item) => String(item.ID)}
                    numColumns={listColumns}
                    key={listColumns}
                    columnWrapperStyle={listColumns > 1 ? { gap: normalize(12) } : null}
                    contentContainerStyle={[
                        s.listContent,
                        puntos.length === 0 && { flex: 1 },
                    ]}
                    style={{ flex: 1, backgroundColor: gb.gray50 }}
                    renderItem={({ item }) => (
                        <PrinterCard
                            item={item}
                            onVincular={handleVincular}
                            onDesvincular={handleDesvincular}
                            onTest={handleTest}
                            vinculando={conectando}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="print-outline" size={normalize(60)} color={gb.gray300} />
                            <Text style={s.emptyText}>
                                No hay puntos de impresión{"\n"}configurados.
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
                            Asegúrate de que la impresora esté encendida.
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
                            {escaneando ? "Buscando..." : "Buscar nuevos dispositivos"}
                        </Text>
                    </Pressable>
                </View>
            </GeneralModal>
        </SafeAreaView>
    );
};

export default Impresoras;
