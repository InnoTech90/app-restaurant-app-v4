import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

export class Database {
    static async getHistorial() {
        const qrData = await AsyncStorage.getItem('qrCode');
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        const historial = await db.getAllAsync(
            `SELECT * FROM HISTORIAL_CAJA WHERE ID_SUCURSAL = ? ORDER BY FECHA DESC`,
            [qrData]
        );
        return historial;
    }
    static async getNombreDispocitivo() {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        const result = await db.getAllAsync(`SELECT NOMBRE_DISPOCITIVO FROM CONFIGURACIONES`);
        return result.length > 0 ? result[0].NOMBRE_DISPOCITIVO : null;
    }
    static async insertarApertura(params) {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        const { idSucursal, nombreDispositivo, monto } = params;
        const result = await db.runAsync(
            `INSERT INTO HISTORIAL_CAJA (ID_SUCURSAL, NOMBRE_DISPOCITIVO, MONTO, ESTATUS) VALUES (?, ?, ?, 1)`,
            [idSucursal, nombreDispositivo, monto]
        );
        return result;
    }
    static async cerrarCaja(id) {
        const db = await SQLite.openDatabaseAsync('APP_RESTAURANT_DB.db');
        await db.runAsync(
            `UPDATE HISTORIAL_CAJA SET ESTATUS = 0 WHERE ID = ?`,
            [id]
        );
    }
}