import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BluetoothEscposPrinter, BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import Database from './database';

// ─────────────────────────────────────────────────────────────────────────────
//  Utilidades
// ─────────────────────────────────────────────────────────────────────────────
const COL_WIDTH = 32;
const SEP = '--------------------------------\n';
const fmt$ = (val) => `$${(val ?? 0).toFixed(2)}`;

const padLine = (left, right) => {
    const maxLeft = COL_WIDTH - right.length - 1;
    const trimmed = left.length > maxLeft ? left.slice(0, maxLeft - 1) + '.' : left;
    const spaces = COL_WIDTH - trimmed.length - right.length;
    return trimmed + ' '.repeat(Math.max(1, spaces)) + right;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
                Alert.alert('Permiso requerido', 'Se necesita acceso a Bluetooth para imprimir.');
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
            Alert.alert('Sin punto de caja', 'No se encontró un punto de impresión de caja configurado.');
            return false;
        }

        const puntoCaja = puntosCaja[0];
        if (!puntoCaja.ID_IMPRESORA) {
            Alert.alert('Sin impresora', 'El punto de caja no tiene impresora vinculada.');
            return false;
        }

        const ALIGN = BluetoothEscposPrinter.ALIGN;

        // Conectar + imprimir en try/finally para liberar la conexión BT siempre
        try {
            try {
                await BluetoothManager.connect(puntoCaja.ID_IMPRESORA);
            } catch (e) {
                await sleep(1000);
                await BluetoothManager.connect(puntoCaja.ID_IMPRESORA);
            }
            await BluetoothEscposPrinter.printerInit();

            // ── ENCABEZADO ────────────────────────────────────────────────────────
            await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
            await BluetoothEscposPrinter.printText('CUENTA\n', { widthtimes: 1, heigthtimes: 1 });
            await BluetoothEscposPrinter.printText(SEP, {});

            // ── INFO ──────────────────────────────────────────────────────────────
            await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
            await BluetoothEscposPrinter.printText(`Mesa : ${mesa?.NOMBRE ?? '-'}\n`, {});
            await BluetoothEscposPrinter.printText(`Folio: #${comanda.FICHA ?? '-'}\n`, {});
            const [fecha, horaFull] = (comanda.FECHA ?? '').split(' ');
            await BluetoothEscposPrinter.printText(
                `${fecha ?? '-'}  ${horaFull?.slice(0, 5) ?? ''}\n`,
                {}
            );
            if (cliente) {
                await BluetoothEscposPrinter.printText(`Cliente: ${cliente.NOMBRE}\n`, {});
            }
            await BluetoothEscposPrinter.printText(SEP, {});

            // ── ARTÍCULOS ─────────────────────────────────────────────────────────
            for (const renglon of articulos) {
                const nombre =
                    renglon.articulo?.NOMBRE ??
                    renglon.articulo?.NOMBRE_CORTO ??
                    '---';
                const cant = renglon.CANTIDAD ?? 1;
                await BluetoothEscposPrinter.printText(
                    padLine(`${cant}x ${nombre}`, fmt$(renglon.TOTAL)) + '\n',
                    {}
                );
                for (const comp of renglon.complementos ?? []) {
                    const cNombre = comp.COMP_NOMBRE ?? comp.complemento?.NOMBRE ?? '---';
                    const cPrecio = comp.COMP_PRECIO ?? comp.complemento?.PRECIO ?? 0;
                    const compLine = cPrecio > 0
                        ? padLine(`  + ${cNombre}`, fmt$(cPrecio))
                        : `  + ${cNombre}`;
                    await BluetoothEscposPrinter.printText(compLine + '\n', {});
                }
            }

            // ── TOTALES ───────────────────────────────────────────────────────────
            await BluetoothEscposPrinter.printText(SEP, {});
            await BluetoothEscposPrinter.printText(
                padLine('Subtotal', fmt$(totales.subtotal)) + '\n', {}
            );
            if ((totales.impuestos ?? 0) > 0) {
                await BluetoothEscposPrinter.printText(
                    padLine('Impuestos', fmt$(totales.impuestos)) + '\n', {}
                );
            }
            if ((totales.descuento ?? 0) > 0) {
                await BluetoothEscposPrinter.printText(
                    padLine('Descuento', `-${fmt$(totales.descuento)}`) + '\n', {}
                );
            }
            if ((totales.propina ?? 0) > 0) {
                await BluetoothEscposPrinter.printText(
                    padLine('Propina', fmt$(totales.propina)) + '\n', {}
                );
            }
            if ((totales.costoEnvio ?? 0) > 0) {
                await BluetoothEscposPrinter.printText(
                    padLine('Envio', fmt$(totales.costoEnvio)) + '\n', {}
                );
            }
            await BluetoothEscposPrinter.printText(SEP, {});

            // Total en grande
            await BluetoothEscposPrinter.printerAlign(ALIGN.RIGHT);
            await BluetoothEscposPrinter.printText(`TOTAL  ${fmt$(totales.total)}\n`, {
                widthtimes: 1,
                heigthtimes: 1,
            });

            // Pago normal (solo cuando no hay pago dividido)
            await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
            await BluetoothEscposPrinter.printText(SEP, {});
            if (pagoDividido.length === 0) {
                await BluetoothEscposPrinter.printText(
                    padLine(`Pago (${metodoPago ?? '-'})`, fmt$(totales.montoRecibido)) + '\n', {}
                );
                if ((totales.cambio ?? 0) > 0) {
                    await BluetoothEscposPrinter.printText(
                        padLine('Cambio', fmt$(totales.cambio)) + '\n', {}
                    );
                }
            }

            // ── PAGO DIVIDIDO (si existe) ─────────────────────────────────────────
            if (pagoDividido.length > 0) {
                await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
                await BluetoothEscposPrinter.printText(SEP, {});
                await BluetoothEscposPrinter.printText('PAGO DIVIDIDO\n', { widthtimes: 1, heigthtimes: 1 });
                for (let i = 0; i < pagoDividido.length; i++) {
                    const fila = pagoDividido[i];
                    const metodoF = formatosPago.find(
                        (f) => (f.ID ?? f.value) === fila.FORMA_PAGO
                    );
                    const metodoNombre = metodoF?.NOMBRE ?? metodoF?.label ?? '-';
                    await BluetoothEscposPrinter.printText(
                        padLine(`  Cliente ${i + 1} (${metodoNombre})`, fmt$(fila.TOTAL)) + '\n', {}
                    );
                }
            }

            // ── FOOTER ────────────────────────────────────────────────────────────
            await BluetoothEscposPrinter.printText(SEP, {});
            await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
            await BluetoothEscposPrinter.printText('¡Gracias por su visita!\n\n\n', {});
            await BluetoothEscposPrinter.printText('\n\n\n', {});
            return true;
        } finally {
            await desconectarImpresora();
        }
    } catch (e) {
        console.error('Error en imprimirCuenta:', e);
        Alert.alert('Error', 'Ocurrió un error al intentar imprimir la cuenta.');
        return false;
    }
};
