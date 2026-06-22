import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BluetoothEscposPrinter, BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import Database from './database';

// ─────────────────────────────────────────────────────────────────────────────
//  Utilidades de formato
// ─────────────────────────────────────────────────────────────────────────────

// Ancho de columna estándar (58mm ≈ 32 chars, 80mm ≈ 48 chars)
const COL_WIDTH = 32;
const SEP = '--------------------------------\n';

const fmt$ = (val) => `$${(val ?? 0).toFixed(2)}`;

/**
 * Genera una línea con texto a la izquierda y precio a la derecha,
 * truncando el nombre si es necesario para que todo quepa en COL_WIDTH.
 */
const padLine = (left, right) => {
    const maxLeft = COL_WIDTH - right.length - 1;
    const trimmed = left.length > maxLeft ? left.slice(0, maxLeft - 1) + '.' : left;
    const spaces = COL_WIDTH - trimmed.length - right.length;
    return trimmed + ' '.repeat(Math.max(1, spaces)) + right;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Impresión de un grupo de artículos en un único punto de impresión
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Conecta con la impresora del punto y envía los artículos correspondientes.
 *
 * @param {object}   punto     - Fila de PUNTOS_IMPRESION (UUID, NOMBRE, ID_IMPRESORA)
 * @param {object[]} renglones - Artículos de la comanda asignados a este punto
 * @param {object}   comanda   - Objeto comanda (FICHA, FECHA, …)
 * @param {object}   mesa      - Objeto mesa (NOMBRE, …)
 * @param {boolean}  esCaja    - Si true, imprime precios y total (ticket de caja)
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Conecta con reintento automático
const conectarImpresora = async (mac) => {
    try {
        await BluetoothManager.connect(mac);
    } catch (e) {
        await sleep(1000);
        await BluetoothManager.connect(mac);
    }
};

// Desconecta liberando la conexión para otros dispositivos
const desconectarImpresora = async () => {
    try {
        await BluetoothManager.disconnect();
    } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
//  Imprime una sección de artículos. La conexión ya debe estar establecida.
//  - esCaja=true  → ticket de caja: nombre + precio
//  - esCaja=false → ticket de cocina/barra: solo nombre y cantidad (sin costos)
// ─────────────────────────────────────────────────────────────────────────────
const imprimirSeccion = async (punto, renglones, comanda, mesa, esCaja) => {
    const ALIGN = BluetoothEscposPrinter.ALIGN;
    await BluetoothEscposPrinter.printerInit();

    // ── ENCABEZADO ────────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
    await BluetoothEscposPrinter.printText(`${punto.NOMBRE}\n`, {
        widthtimes: 1,
        heigthtimes: 1,
    });
    await BluetoothEscposPrinter.printText(SEP, {});

    // ── INFO MESA / FOLIO ─────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(`Mesa: ${mesa?.NOMBRE ?? '-'}\n`, {});
    await BluetoothEscposPrinter.printText(`Folio: #${comanda.FICHA ?? '-'}\n`, {});
    const [fecha, horaFull] = (comanda.FECHA ?? '').split(' ');
    await BluetoothEscposPrinter.printText(
        `${fecha ?? '-'}  ${horaFull?.slice(0, 5) ?? ''}\n`,
        {}
    );
    await BluetoothEscposPrinter.printText(SEP, {});

    // ── ARTÍCULOS ─────────────────────────────────────────────────────────────
    for (const renglon of renglones) {
        const nombre =
            renglon.articulo?.NOMBRE ??
            renglon.articulo?.NOMBRE_CORTO ??
            '---';
        const cant = renglon.CANTIDAD ?? 1;

        if (esCaja) {
            // Caja: nombre + precio
            await BluetoothEscposPrinter.printText(
                padLine(`${cant}x ${nombre}`, fmt$(renglon.TOTAL)) + '\n',
                {}
            );
        } else {
            // Cocina/barra: solo cantidad y nombre, sin precios
            await BluetoothEscposPrinter.printText(`${cant}x ${nombre}\n`, {});
        }

        // Complementos (notas de preparación)
        for (const comp of renglon.complementos ?? []) {
            const cNombre = comp.complemento?.NOMBRE ?? '---';
            await BluetoothEscposPrinter.printText(`  + ${cNombre}\n`, {});
        }
    }

    // ── TOTAL (solo caja) ─────────────────────────────────────────────────────
    if (esCaja) {
        const total = renglones.reduce((s, r) => s + (r.TOTAL ?? 0), 0);
        await BluetoothEscposPrinter.printText(SEP, {});
        await BluetoothEscposPrinter.printerAlign(ALIGN.RIGHT);
        await BluetoothEscposPrinter.printText(`TOTAL: ${fmt$(total)}\n`, {
            widthtimes: 1,
            heigthtimes: 1,
        });
    }

    // ── NOTA (si existe) ──────────────────────────────────────────────────────
    if (comanda.NOTA) {
        await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
        await BluetoothEscposPrinter.printText(SEP, {});
        await BluetoothEscposPrinter.printText(`Nota: ${comanda.NOTA}\n`, {});
    }

    // Avance de papel
    await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
    await BluetoothEscposPrinter.printText('\n\n\n', {});
};

// ─────────────────────────────────────────────────────────────────────────────
//  Función principal exportada
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Imprime la comanda en cada impresora según el PUNTO_IMPRESION de cada artículo.
 *
 * - Agrupa los artículos por articulo.PUNTO_IMPRESION (UUID).
 * - Conecta con cada impresora vinculada al punto y envía el grupo.
 * - El punto 'PRIMER_PUNTO' (Caja) imprime precios y total.
 * - Los demás puntos (cocina, barra, etc.) imprimen sólo nombre, cantidad y complementos.
 * - Los puntos sin impresora vinculada se omiten silenciosamente.
 *
 * @param {object}   comanda      - Objeto comanda (ID, FICHA, FECHA, NOTA, …)
 * @param {object[]} articulos    - Renglones con `.articulo` y `.complementos`
 * @param {object}   mesa         - Objeto mesa (NOMBRE, …)
 * @param {boolean}  sinPrecios   - Si true, nunca imprime precios/total (ticket de cocina)
 * @returns {Promise<boolean>} true si al menos una impresión fue exitosa
 */
export const imprimirComanda = async (comanda, articulos, mesa, sinPrecios = false) => {
    try {
        // Permisos BT (Android 12+) — se solicitan una sola vez
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        }

        // Asegurar que el Bluetooth esté habilitado
        await BluetoothManager.enableBluetooth();

        // Respetar configuración SOLO_PRODUCTOS_NUEVOS
        const config = await Database.getConfiguraciones();
        const articulosParaImprimir = config?.SOLO_PRODUCTOS_NUEVOS
            ? articulos.filter(r => !r.IMPRESO)
            : articulos;

        if (!articulosParaImprimir.length) {
            Alert.alert('Sin artículos', 'No hay artículos nuevos para imprimir.');
            return false;
        }

        const puntos = await Database.getPuntosImpresion();
        // Mapa UUID → fila de PUNTOS_IMPRESION
        const puntosMap = Object.fromEntries(puntos.map((p) => [p.UUID, p]));

        // Artículos sin PUNTO_IMPRESION (null/0/'') → siempre caja (PRIMER_PUNTO)
        const fallbackUuid = 'PRIMER_PUNTO';

        // ── Paso 1: agrupar renglones por PUNTO_IMPRESION ─────────────────────
        const gruposPorPunto = {};
        for (const renglon of articulosParaImprimir) {
            const raw = renglon.articulo?.PUNTO_IMPRESION;
            const uuid = (raw === null || raw === undefined || raw === 0 || raw === '')
                ? fallbackUuid
                : String(raw);
            if (!gruposPorPunto[uuid]) gruposPorPunto[uuid] = [];
            gruposPorPunto[uuid].push(renglon);
        }

        // ── Paso 2: agrupar por MAC (misma impresora puede tener varios puntos) ─
        // gruposPorMac[mac] = [{ punto, renglones, esCaja }, ...]
        const gruposPorMac = {};
        for (const [uuid, renglones] of Object.entries(gruposPorPunto)) {
            const punto = puntosMap[uuid];
            if (!punto) {
                console.warn(`Punto de impresión no encontrado en BD: ${uuid}`);
                continue;
            }
            if (!punto.ID_IMPRESORA) {
                console.warn(`Punto "${punto.NOMBRE}" no tiene impresora vinculada, se omite.`);
                continue;
            }
            const mac = punto.ID_IMPRESORA;
            if (!gruposPorMac[mac]) gruposPorMac[mac] = [];
            // sinPrecios=true → ticket de cocina: nunca imprimir precios en ningún punto
            gruposPorMac[mac].push({ punto, renglones, esCaja: !sinPrecios && uuid === 'PRIMER_PUNTO' });
        }

        // Si ningún punto tiene impresora vinculada, devolver señal para mostrar modal
        if (Object.keys(gruposPorMac).length === 0) {
            return 'SIN_IMPRESORA';
        }

        const errores = [];
        let impresos = 0;

        // ── Paso 3: 1 conexión por impresora física, desconectar al terminar ───
        for (const [mac, secciones] of Object.entries(gruposPorMac)) {
            try {
                await conectarImpresora(mac);
                for (const { punto, renglones, esCaja } of secciones) {
                    await imprimirSeccion(punto, renglones, comanda, mesa, esCaja);
                }
                impresos++;
            } catch (e) {
                const nombres = secciones.map((s) => s.punto.NOMBRE).join(', ');
                console.error(
                    `Error imprimiendo en (${mac}) [${nombres}]:`,
                    e?.message ?? e
                );
                errores.push(nombres);
            } finally {
                await desconectarImpresora();
            }
        }

        if (errores.length > 0) {
            Alert.alert(
                'Error de impresión',
                `No se pudo conectar con: ${errores.join(', ')}.\nVerifica que estén encendidas y en rango.`
            );
        }

        if (impresos > 0) {
            await Database.marcarArticulosImpresos(articulosParaImprimir.map(r => r.ID));
        }

        return impresos > 0;
    } catch (e) {
        console.error('Error en imprimirComanda:', e);
        Alert.alert('Error', 'Ocurrió un error al intentar imprimir la comanda.');
        return false;
    }
};
