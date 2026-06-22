import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../../utils/db";

export class Database {
    /** Trae los grupos de complementos y sus complementos para un artículo */
    static async getComplementos(articuloUUID) {
        return withDb(async (db) => {
            const grupos = await db.getAllAsync(
                `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
                [articuloUUID]
            );
            for (const grupo of grupos) {
                grupo.complementos = await db.getAllAsync(
                    `SELECT * FROM COMPLEMENTO WHERE ID_GRUPO_COMP = ? ORDER BY POSICION`,
                    [grupo.UUID]
                );
            }
            return grupos;
        });
    }
    static async insertComanda(data) {
        const id_sucursal = await AsyncStorage.getItem("qrCode");
        const device_key = await AsyncStorage.getItem("deviceKey");
        return withDb(async (db) => {

        // Buscar comanda abierta (ESTATUS=0) para esta mesa
        const comandaExistente = await db.getFirstAsync(
            `SELECT ID FROM COMANDA WHERE ID_MESA = ? AND ESTATUS = 0 AND ACTIVO = 1 LIMIT 1`,
            [data.id_mesa]
        );

        let id_comanda;
        if (comandaExistente) {
            // Reutilizar la comanda abierta
            id_comanda = comandaExistente.ID;
        } else {
            // Calcular el siguiente número de folio
            const fichaRow = await db.getFirstAsync(
                `SELECT COALESCE(MAX(FICHA), 0) + 1 AS NEXT_FICHA FROM COMANDA`
            );
            const nextFicha = fichaRow?.NEXT_FICHA ?? 1;

            // Crear nueva comanda
            const comandaResult = await db.runAsync(
                `INSERT INTO COMANDA (
                    ID_MESA,
                    ID_SUCURSAL,
                    DEVICE_KEY,
                    NOTA,
                    FICHA,
                    ESTATUS,
                    SINCRONIZADO
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.id_mesa,
                    id_sucursal,
                    device_key,
                    data.nota || "",
                    nextFicha,
                    0,
                    0,
                ]
            );
            id_comanda = comandaResult.lastInsertRowId;
        }

        // Insertar cada artículo en la comanda
        for (const articulo of data.articulos) {
            const articuloResult = await db.runAsync(
                `INSERT INTO COMANDA_ARTICULO (
                    ID_COMANDA,
                    ID_ARTICULO,
                    CANTIDAD_CANCELADOS,
                    CANTIDAD,
                    PRECIO_VENTA,
                    NOTA,
                    SUBTOTAL,
                    TOTAL
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_comanda,
                    articulo.ID_ARTICULO ?? null,
                    0,
                    articulo.CANTIDAD ?? 0,
                    articulo.PRECIO_VENTA ?? 0,
                    articulo.NOTA ?? "",
                    articulo.SUBTOTAL ?? 0,
                    articulo.TOTAL ?? 0,
                ]
            );

            const id_comanda_articulo = articuloResult.lastInsertRowId;
            for (const complemento of articulo.complementos) {
                await db.runAsync(
                    `INSERT INTO COMANDA_COMPLEMENTO (
                        ID_COMANDA_ARTICULO,
                        ID_COMPLEMENTO,
                        CANTIDAD_CANCELADOS,
                        CANTIDAD,
                        PRECIO_VENTA,
                        NOTA,
                        SUBTOTAL,
                        TOTAL
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id_comanda_articulo ?? null,
                        complemento.ID_COMPLEMENTO ?? null,
                        0,
                        complemento.CANTIDAD ?? 0,
                        complemento.PRECIO_VENTA ?? 0,
                        complemento.NOTA ?? "",
                        complemento.SUBTOTAL ?? 0,
                        complemento.TOTAL ?? 0,
                    ]
                );
            }
        }
        });
    }

}
