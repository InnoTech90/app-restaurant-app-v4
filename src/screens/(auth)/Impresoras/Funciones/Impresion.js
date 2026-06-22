import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
    BluetoothEscposPrinter,
    BluetoothManager,
} from 'react-native-bluetooth-escpos-printer';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────────────
//  Permisos (Android 12+)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Solicita BLUETOOTH_SCAN y BLUETOOTH_CONNECT en tiempo de ejecución (API ≥ 31).
 * @returns {Promise<boolean>} true si los permisos fueron concedidos o no son necesarios.
 */
export const solicitarPermisosBluetooth = async () => {
    if (Platform.OS !== 'android' || Platform.Version < 31) return true;
    const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(grants).every(
        (g) => g === PermissionsAndroid.RESULTS.GRANTED
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Conexión
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Conecta con la impresora especificada por dirección MAC.
 * Si no está emparejada, muestra el diálogo de vinculación de Android.
 * @param {string} address  Dirección MAC del dispositivo.
 * @returns {Promise<void>}
 */
export const conectarImpresora = async (address) => {
    // En algunos dispositivos Android, connect() lanza incluso cuando la conexión
    // BT se establece correctamente (socket residual). Se reintenta tras 1 s.
    try {
        await BluetoothManager.connect(address);
    } catch (e) {
        await sleep(1000);
        await BluetoothManager.connect(address);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Desconexión temporal (liberar socket después de vincular)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Cierra el socket BT activo. Android permite ~5-7 conexiones simultáneas;
 * llamar esto após vincular evita agotar el stack.
 */
export const liberarConexionBT = async () => {
    try {
        await BluetoothManager.disconnect();
    } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
//  Desconexión / desemparejamiento
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Desconecta y desempareja la impresora especificada.
 * @param {string} address  Dirección MAC del dispositivo.
 * @returns {Promise<void>}
 */
export const desconectarImpresora = async (address) => {
    await BluetoothManager.unpair(address);
};

// ─────────────────────────────────────────────────────────────────────────────
//  Impresión
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Conecta con la impresora, la inicializa y ejecuta la función de impresión.
 * Centraliza el manejo de errores de conexión e impresión.
 *
 * @param {string}            address     Dirección MAC de la impresora.
 * @param {() => Promise<void>} imprimirFn  Función async con los comandos ESC/POS.
 * @returns {Promise<boolean>} true si la impresión fue exitosa.
 */
export const imprimirConImpresora = async (address, imprimirFn) => {
    try {
        await BluetoothManager.connect(address);
        await BluetoothEscposPrinter.printerInit();
        await imprimirFn();
        return true;
    } catch (e) {
        Alert.alert(
            'Error de impresión',
            'No se pudo conectar con la impresora. Verifica que esté encendida y en rango.'
        );
        return false;
    }
};
