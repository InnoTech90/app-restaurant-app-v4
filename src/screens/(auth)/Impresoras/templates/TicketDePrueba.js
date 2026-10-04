import { BluetoothEscposPrinter } from '../../../../utils/bluetoothEscpos';
import { withDb } from '../../../../utils/db';
import { perfilTamanoTicket } from '../../(mesas)/Ticket/Plantillas/cuenta';
import { construirLineasPrueba } from '../../(mesas)/Ticket/Plantillas/prueba';
import { imprimirConImpresora } from '../Funciones/Impresion';

const SEP = '--------------------------------\n';

const leerTamanoTicket = () =>
    withDb('Impresoras.tamanoTicket', async (db) => {
        const fila = await db.getFirstAsync(
            `SELECT f.NOMBRE AS TAMANO
             FROM CONFIGURACIONES c
             LEFT JOIN TAMAÑO_FUENTES f ON f.ID = c.ID_TAMAÑO_FUENTE
             LIMIT 1`,
        );
        return fila?.TAMANO ?? null;
    });

export const imprimirTicketPrueba = async (punto, opciones) => {
    const tamano = perfilTamanoTicket(await leerTamanoTicket().catch(() => null));
    const cuerpo = {
        fonttype: tamano.fonttype,
        widthtimes: tamano.widthtimes,
        heigthtimes: tamano.heigthtimes,
    };
    const destacado = {
        ...cuerpo,
        heigthtimes: Math.min(tamano.heigthtimes + 1, 2),
    };
    const lineas = construirLineasPrueba({ punto });

    return imprimirConImpresora(
        punto.ID_IMPRESORA,
        async () => {
            const ALIGN = BluetoothEscposPrinter.ALIGN;
            for (const linea of lineas) {
                if (linea.kind === 'feed') {
                    await BluetoothEscposPrinter.printText('\n\n\n', {});
                    continue;
                }

                const align = linea.kind === 'center' ? 'CENTER' : 'LEFT';
                await BluetoothEscposPrinter.printerAlign(ALIGN[align]);

                if (linea.kind === 'sep') {
                    await BluetoothEscposPrinter.printText(SEP, cuerpo);
                    continue;
                }

                const opts = linea.size === 'lg' ? destacado : cuerpo;
                await BluetoothEscposPrinter.printText(`${linea.text}\n`, opts);
            }
        },
        opciones,
    );
};
