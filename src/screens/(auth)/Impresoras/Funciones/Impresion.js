import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
    BluetoothEscposPrinter,
    BluetoothManager,
    isBluetoothEscposDisponible,
} from '../../../../utils/bluetoothEscpos';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Normaliza MAC a formato XX:XX:XX:XX:XX:XX en mayúsculas. */
export const normalizarMac = (address) => {
    if (!address) return '';
    return String(address).trim().toUpperCase().replace(/-/g, ':');
};

/**
 * Solicita permisos de Bluetooth según la versión de Android.
 * @returns {Promise<boolean>}
 */
export const solicitarPermisosBluetooth = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 31) {
        const grants = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return Object.values(grants).every(
            (g) => g === PermissionsAndroid.RESULTS.GRANTED,
        );
    }

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * Permisos + activar Bluetooth antes de imprimir o escanear.
 * @returns {Promise<boolean>}
 */
export const prepararBluetooth = async () => {
    if (!isBluetoothEscposDisponible()) return false;
    if (Platform.OS !== 'android') return true;

    const permisosOk = await solicitarPermisosBluetooth();
    if (!permisosOk) {
        Alert.alert(
            'Permisos requeridos',
            'Activa los permisos de Bluetooth y ubicación para imprimir.',
        );
        return false;
    }

    try {
        await BluetoothManager.enableBluetooth();
    } catch (e) {
        console.warn('[BT] enableBluetooth:', e?.message ?? e);
        Alert.alert(
            'Bluetooth',
            'Activa Bluetooth en el dispositivo e intenta de nuevo.',
        );
        return false;
    }

    return true;
};

/**
 * Cierra el socket BT activo. Necesario al cambiar entre impresoras.
 */
export const liberarConexionBT = async () => {
    if (!BluetoothManager?.disconnect) return;
    try {
        await BluetoothManager.disconnect();
    } catch (_) {}
};

/**
 * Conecta con la impresora (desconecta antes, normaliza MAC, reintenta).
 * @returns {Promise<boolean>}
 */
export const conectarImpresora = async (address) => {
    if (!isBluetoothEscposDisponible()) return false;
    const mac = normalizarMac(address);
    if (!mac) return false;

    await liberarConexionBT();
    await sleep(800);

    for (let intento = 0; intento < 2; intento++) {
        try {
            await BluetoothManager.connect(mac);
            await sleep(600);
            return true;
        } catch (e) {
            console.warn(
                `[BT] connect intento ${intento + 1} (${mac}):`,
                e?.message ?? e,
            );
            if (intento === 0) {
                await liberarConexionBT();
                await sleep(1200);
            }
        }
    }

    return false;
};

export const desconectarImpresora = async (address) => {
    await liberarConexionBT();
    const mac = normalizarMac(address);
    if (!mac || !BluetoothManager?.unpair) return;
    try {
        await BluetoothManager.unpair(mac);
    } catch (_) {}
};

/**
 * Conecta, imprime y libera la conexión al terminar.
 * @returns {Promise<boolean>}
 */
export const imprimirConImpresora = async (address, imprimirFn) => {
    if (!isBluetoothEscposDisponible()) {
        Alert.alert(
            'Impresión no disponible',
            'El módulo Bluetooth no está cargado. Reinstala el APK de producción.',
        );
        return false;
    }

    const mac = normalizarMac(address);
    if (!mac) {
        Alert.alert('Impresora inválida', 'La MAC de la impresora no es válida.');
        return false;
    }

    const btOk = await prepararBluetooth();
    if (!btOk) return false;

    try {
        const conectado = await conectarImpresora(mac);
        if (!conectado) {
            Alert.alert(
                'Sin conexión',
                `No se pudo conectar con ${mac}. Verifica que la impresora esté encendida, emparejada en Ajustes → Bluetooth y cerca del dispositivo.`,
            );
            return false;
        }

        await BluetoothEscposPrinter.printerInit();
        await sleep(200);
        await imprimirFn();
        await sleep(800);
        return true;
    } catch (e) {
        console.warn('[BT] Error imprimiendo en', mac, e?.message ?? e);
        Alert.alert(
            'Error de impresión',
            e?.message ?? 'Ocurrió un error al enviar datos a la impresora.',
        );
        return false;
    } finally {
        await sleep(300);
        await liberarConexionBT();
    }
};
