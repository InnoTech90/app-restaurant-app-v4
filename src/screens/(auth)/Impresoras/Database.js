import * as SQLite from 'expo-sqlite';

export class Database {
    static async getPuntosImpresion() {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        const puntos = await db.getAllAsync(
            `SELECT * FROM PUNTOS_IMPRESION`
        );
        return puntos;
    }

    static async vincularImpresora(id, idImpresora) {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        await db.runAsync(
            `UPDATE PUNTOS_IMPRESION SET ID_IMPRESORA = ? WHERE ID = ?`,
            [idImpresora, id]
        );
    }

    static async desvincularImpresora(id) {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        await db.runAsync(
            `UPDATE PUNTOS_IMPRESION SET ID_IMPRESORA = NULL WHERE ID = ?`,
            [id]
        );
    }

    // ── Caché de dispositivos Bluetooth ─────────────────────────────────────
    static async getDispositivosBluetooth() {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        const rows = await db.getAllAsync(`SELECT * FROM BLUETOOTH_ENCONTRADOS ORDER BY TIPO, NAME`);
        const paired = rows.filter(r => r.TIPO === 'paired').map(r => ({ address: r.ADDRESS, name: r.NAME }));
        const found  = rows.filter(r => r.TIPO === 'found').map(r => ({ address: r.ADDRESS, name: r.NAME }));
        return { paired, found };
    }

    static async guardarDispositivosBluetooth(paired = [], found = []) {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        await db.runAsync(`DELETE FROM BLUETOOTH_ENCONTRADOS`);
        for (const d of paired) {
            await db.runAsync(
                `INSERT OR REPLACE INTO BLUETOOTH_ENCONTRADOS (ADDRESS, NAME, TIPO) VALUES (?, ?, 'paired')`,
                [d.address, d.name || '']
            );
        }
        for (const d of found) {
            await db.runAsync(
                `INSERT OR REPLACE INTO BLUETOOTH_ENCONTRADOS (ADDRESS, NAME, TIPO) VALUES (?, ?, 'found')`,
                [d.address, d.name || '']
            );
        }
    }
}
