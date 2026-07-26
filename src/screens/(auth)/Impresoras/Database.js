import { withDb } from '../../../utils/db';

export class Database {

    static async getPuntosImpresion() {
        return withDb("Impresoras.getPuntosImpresion", async (db) => {
            return await db.getAllAsync(
                `SELECT * FROM PUNTOS_IMPRESION`
            );
        });
    }


    static async vincularImpresora(id, idImpresora) {
        return withDb("Impresoras.vincularImpresora", async (db) => {

            await db.runAsync(
                `
                UPDATE PUNTOS_IMPRESION
                SET ID_IMPRESORA = ?
                WHERE ID = ?
                `,
                [idImpresora, id]
            );

        });
    }


    static async desvincularImpresora(id) {
        return withDb("Impresoras.desvincularImpresora", async (db) => {

            await db.runAsync(
                `
                UPDATE PUNTOS_IMPRESION
                SET ID_IMPRESORA = NULL
                WHERE ID = ?
                `,
                [id]
            );

        });
    }


    static async getDispositivosBluetooth() {

        return withDb("Bluetooth.getDispositivosBluetooth", async (db) => {

            const rows = await db.getAllAsync(
                `
                SELECT *
                FROM BLUETOOTH_ENCONTRADOS
                ORDER BY TIPO, NAME
                `
            );

            return {
                paired: rows
                    .filter(r => r.TIPO === 'paired')
                    .map(r => ({
                        address: r.ADDRESS,
                        name: r.NAME
                    })),

                found: rows
                    .filter(r => r.TIPO === 'found')
                    .map(r => ({
                        address: r.ADDRESS,
                        name: r.NAME
                    }))
            };

        });
    }


    static async guardarDispositivosBluetooth(paired = [], found = []) {

        return withDb("Bluetooth.guardarDispositivosBluetooth", async (db) => {

            await db.runAsync(
                `DELETE FROM BLUETOOTH_ENCONTRADOS`
            );


            for (const d of paired) {

                await db.runAsync(
                    `
                    INSERT OR REPLACE INTO BLUETOOTH_ENCONTRADOS
                    (ADDRESS, NAME, TIPO)
                    VALUES (?, ?, 'paired')
                    `,
                    [
                        d.address,
                        d.name || ''
                    ]
                );

            }


            for (const d of found) {

                await db.runAsync(
                    `
                    INSERT OR REPLACE INTO BLUETOOTH_ENCONTRADOS
                    (ADDRESS, NAME, TIPO)
                    VALUES (?, ?, 'found')
                    `,
                    [
                        d.address,
                        d.name || ''
                    ]
                );

            }

        });
    }
}