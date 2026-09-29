import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
    BluetoothEscposPrinter,
    BluetoothManager,
    isBluetoothEscposDisponible,
    MENSAJE_BT_NO_DISPONIBLE,
} from '../../../../utils/bluetoothEscpos';
import { withDb } from '../../../../utils/db';
import { construirLineasCuenta, padLine, perfilTamanoTicket } from '../Ticket/Plantillas/cuenta';
import Database from './database';

const getEncabezadoTicket = () =>
    withDb('Pago.encabezadoTicket', async (db) => {
        const negocio = await db.getFirstAsync(
            `SELECT NOMBRE_NEGOCIO, DIRECCION, TELEFONO FROM NEGOCIO LIMIT 1`,
        );
        const sucursal = await db.getFirstAsync(
            `SELECT NOMBRE, DIRECCION, TELEFONO FROM SUCURSAL LIMIT 1`,
        );
        const tamano = await db.getFirstAsync(
            `SELECT f.NOMBRE AS TAMANO
             FROM CONFIGURACIONES c
             LEFT JOIN TAMAÑO_FUENTES f ON f.ID = c.ID_TAMAÑO_FUENTE
             LIMIT 1`,
        );
        return { negocio, sucursal, tamano: tamano?.TAMANO };
    });

const SEP = '--------------------------------\n';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const conectarImpresora = async (mac) => {
    try {
        await BluetoothManager.connect(mac);
        return true;
    } catch (_) {
        await sleep(1000);
        try {
            await BluetoothManager.connect(mac);
            return true;
        } catch (_) {
            return false;
        }
    }
};

// Desconecta liberando la conexión para otros dispositivos
const desconectarImpresora = async () => {
    try {
        await BluetoothManager.disconnect();
    } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
//  Impresión de cuenta de pago (ticket de caja completo con totales)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Imprime el ticket de cuenta con desglose de pago.
 *
 * @param {object}   comanda      - Fila de COMANDA
 * @param {object[]} articulos    - Renglones enriquecidos de la comanda
 * @param {object}   mesa         - Fila de MESA
 * @param {object}   cliente      - Fila de CLIENTES (puede ser null)
 * @param {object}   totales      - { subtotal, impuestos, descuento, propina, costoEnvio, total, montoRecibido, cambio }
 * @param {string}   metodoPago   - Nombre del método de pago seleccionado
 */
export const imprimirCuenta = async (comanda, articulos, mesa, cliente, totales, metodoPago, pagoDividido = [], formatosPago = []) => {
    try {
        if (!isBluetoothEscposDisponible()) {
            Alert.alert('Impresión no disponible', MENSAJE_BT_NO_DISPONIBLE);
            return false;
        }

        if (Platform.OS === 'android' && Platform.Version >= 31) {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        } else if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                return false;
            }
        }

        const puntosRaw = await Database.getPuntosImpresion();
        const puntosMap = {};
        for (const p of puntosRaw) {
            puntosMap[p.UUID] = p;
        }

        // Solo imprime en PRIMER_PUNTO (caja)
        const puntosCaja = puntosRaw.filter(p => p.UUID === 'PRIMER_PUNTO');
        if (puntosCaja.length === 0) {
            return false;
        }

        const puntoCaja = puntosCaja[0];
        if (!puntoCaja.ID_IMPRESORA) {
            return false;
        }

        const ALIGN = BluetoothEscposPrinter.ALIGN;

        const conectado = await conectarImpresora(puntoCaja.ID_IMPRESORA);
        if (!conectado) {
            return false;
        }

        try {
            await BluetoothEscposPrinter.printerInit();

            const encabezado = await getEncabezadoTicket();
            const tamano = perfilTamanoTicket(encabezado?.tamano);
            const cuerpo = {
                fonttype: tamano.fonttype,
                widthtimes: tamano.widthtimes,
                heigthtimes: tamano.heigthtimes,
            };
            const destacado = {
                ...cuerpo,
                heigthtimes: Math.min(tamano.heigthtimes + 1, 2),
            };
            const lineas = construirLineasCuenta({
                negocio: encabezado?.negocio,
                sucursal: encabezado?.sucursal,
                comanda,
                articulos,
                mesa,
                cliente,
                totales,
                metodoPago,
                pagoDividido,
                formatosPago,
                impresion: (Number(comanda?.CONT_IMPRESO) || 0) + 1,
            });

            for (const linea of lineas) {
                if (linea.kind === 'feed') {
                    await BluetoothEscposPrinter.printText('\n\n\n', {});
                    continue;
                }

                const align =
                    linea.align ??
                    (linea.kind === 'center'
                        ? 'center'
                        : linea.kind === 'right'
                          ? 'right'
                          : 'left');
                await BluetoothEscposPrinter.printerAlign(ALIGN[align.toUpperCase()]);

                if (linea.kind === 'sep') {
                    await BluetoothEscposPrinter.printText(SEP, {});
                    continue;
                }

                const opts = linea.size === 'lg' ? destacado : cuerpo;
                const texto =
                    linea.kind === 'pair'
                        ? padLine(linea.left, linea.right)
                        : linea.text;
                await BluetoothEscposPrinter.printText(`${texto}\n`, opts);
            }
            return true;
        } finally {
            await desconectarImpresora();
        }
    } catch (e) {
        console.warn('Error inesperado en imprimirCuenta:', e?.message ?? e);
        return false;
    }
};
