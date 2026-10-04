import { Alert, Platform } from 'react-native';
import { BluetoothEscposPrinter, isBluetoothEscposDisponible } from '../../../../utils/bluetoothEscpos';
import { withDb } from '../../../../utils/db';
import {
    conectarImpresora,
    liberarConexionBT,
    normalizarMac,
    prepararBluetooth,
    sleep,
} from '../../Impresoras/Funciones/Impresion';
import Database from './database';
import { padLine, perfilTamanoTicket } from './Plantillas/cuenta';
import { construirLineasPreparacion } from './Plantillas/preparacion';

// ─────────────────────────────────────────────────────────────────────────────
//  Utilidades de formato
// ─────────────────────────────────────────────────────────────────────────────

const SEP = '--------------------------------\n';

const fmt$ = (val) => `$${(val ?? 0).toFixed(2)}`;

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
const leerTamanoTicket = () =>
    withDb('Ticket.tamanoPreparacion', async (db) => {
        const fila = await db.getFirstAsync(
            `SELECT f.NOMBRE AS TAMANO
             FROM CONFIGURACIONES c
             LEFT JOIN TAMAÑO_FUENTES f ON f.ID = c.ID_TAMAÑO_FUENTE
             LIMIT 1`,
        );
        return fila?.TAMANO ?? null;
    });

const imprimirLineas = async (lineas, perfil) => {
    const ALIGN = BluetoothEscposPrinter.ALIGN;
    const cuerpo = {
        fonttype: perfil.fonttype,
        widthtimes: perfil.widthtimes,
        heigthtimes: perfil.heigthtimes,
    };
    const destacado = {
        ...cuerpo,
        heigthtimes: Math.min(perfil.heigthtimes + 1, 2),
    };

    await BluetoothEscposPrinter.printerInit();

    for (const linea of lineas) {
        if (linea.kind === 'feed') {
            await BluetoothEscposPrinter.printText('\n\n\n', {});
            continue;
        }
        if (linea.kind === 'space') {
            await BluetoothEscposPrinter.printText('\n', cuerpo);
            continue;
        }

        const align = linea.kind === 'center' ? 'CENTER' : 'LEFT';
        await BluetoothEscposPrinter.printerAlign(ALIGN[align]);

        if (BluetoothEscposPrinter.setBlob) {
            await BluetoothEscposPrinter.setBlob(linea.bold ? 1 : 0);
        }

        if (linea.kind === 'sep') {
            await BluetoothEscposPrinter.printText(SEP, cuerpo);
            continue;
        }

        const opts = linea.size === 'lg' ? destacado : cuerpo;
        const texto =
            linea.kind === 'pair'
                ? padLine(linea.left, linea.right)
                : linea.text;
        await BluetoothEscposPrinter.printText(`${texto}\n`, opts);
    }

    if (BluetoothEscposPrinter.setBlob) {
        await BluetoothEscposPrinter.setBlob(0);
    }
};

const imprimirSeccion = async (punto, renglones, comanda, mesa, esCaja, perfil) => {
    if (!esCaja) {
        const lineas = construirLineasPreparacion({
            punto,
            comanda,
            mesa,
            articulos: renglones,
        });
        await imprimirLineas(lineas, perfil);
        return;
    }

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
        if (Platform.OS !== 'android') {
            Alert.alert('No disponible', 'La impresión Bluetooth solo está disponible en Android.');
            return false;
        }

        if (!isBluetoothEscposDisponible()) {
            Alert.alert(
                'Impresión no disponible',
                'El módulo Bluetooth no está cargado. Reinstala el APK de producción.',
            );
            return false;
        }

        const btOk = await prepararBluetooth();
        if (!btOk) {
            Alert.alert(
                'Permisos requeridos',
                'Se necesitan permisos de Bluetooth y ubicación para imprimir.',
            );
            return false;
        }

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
        const puntosMap = Object.fromEntries(
            puntos.map((p) => [String(p.UUID).trim(), p]),
        );

        const fallbackUuid = 'PRIMER_PUNTO';

        const gruposPorPunto = {};
        for (const renglon of articulosParaImprimir) {
            const raw = renglon.articulo?.PUNTO_IMPRESION;
            const uuid = (raw === null || raw === undefined || raw === 0 || raw === '')
                ? fallbackUuid
                : String(raw).trim();
            if (!gruposPorPunto[uuid]) gruposPorPunto[uuid] = [];
            gruposPorPunto[uuid].push(renglon);
        }

        const gruposPorMac = {};
        const puntosSinImpresora = [];

        for (const [uuid, renglones] of Object.entries(gruposPorPunto)) {
            const punto = puntosMap[uuid];
            if (!punto) {
                console.warn(`Punto de impresión no encontrado en BD: ${uuid}`);
                continue;
            }
            const mac = normalizarMac(punto.ID_IMPRESORA);
            if (!mac) {
                puntosSinImpresora.push(punto.NOMBRE);
                continue;
            }
            if (!gruposPorMac[mac]) gruposPorMac[mac] = [];
            gruposPorMac[mac].push({
                punto,
                renglones,
                esCaja: !sinPrecios && uuid === 'PRIMER_PUNTO',
            });
        }

        if (puntosSinImpresora.length > 0) {
            Alert.alert(
                'Sin impresora vinculada',
                `Vincula una impresora en Ajustes → Impresoras para: ${puntosSinImpresora.join(', ')}.`,
            );
        }

        if (Object.keys(gruposPorMac).length === 0) {
            return puntosSinImpresora.length > 0 ? false : 'SIN_IMPRESORA';
        }

        const perfil = perfilTamanoTicket(
            await leerTamanoTicket().catch(() => null),
        );

        const errores = [];
        let impresos = 0;

        for (const [mac, secciones] of Object.entries(gruposPorMac)) {
            const nombres = secciones.map((s) => s.punto.NOMBRE).join(', ');
            try {
                const conectado = await conectarImpresora(mac);
                if (!conectado) {
                    errores.push(`${nombres} (${mac})`);
                    continue;
                }

                await sleep(200);

                for (const { punto, renglones, esCaja } of secciones) {
                    await imprimirSeccion(punto, renglones, comanda, mesa, esCaja, perfil);
                }
                impresos++;
            } catch (e) {
                console.error(
                    `Error imprimiendo en (${mac}) [${nombres}]:`,
                    e?.message ?? e,
                );
                errores.push(nombres);
            } finally {
                await sleep(500);
                await liberarConexionBT();
            }
        }

        if (errores.length > 0) {
            Alert.alert(
                'Error de impresión',
                `No se pudo imprimir en: ${errores.join(', ')}.\n\nVerifica en Impresoras que cada punto tenga su impresora vinculada, encendida y emparejada en Bluetooth.`,
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
