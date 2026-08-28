import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";

export class Database {
  /**
   * DEPRECATED: Migraciones ahora son manejadas por DatabaseInitializer.
   * Este método se mantiene solo por compatibilidad.
   */
  static async _migrate() {
    console.log("ℹ️  Migraciones ahora manejadas por DatabaseInitializer");
    // Las columnas CIUDAD, ESTADO, WHATSAPP son agregadas por DatabaseInitializer en v1
    return Promise.resolve();
  }

  static async getClientes() {
    // Ya no necesita migración - DatabaseInitializer se encarga
    const qrData = await AsyncStorage.getItem("qrCode");
    return withDb("Clientes.getClientes", (db) =>
      db.getAllAsync(
        `SELECT * FROM CLIENTES WHERE ACTIVO = 1 AND SUCURSAL = ? ORDER BY NOMBRE ASC`,
        [qrData],
      ),
    );
  }

  static async insertCliente(cliente) {
    const qrData = await AsyncStorage.getItem("qrCode");
    return withDb("Clientes.insertCliente", (db) =>
      db.runAsync(
        `INSERT INTO CLIENTES
                    (NOMBRE, TELEFONO, CORREO, DIRECCION, CIUDAD, ESTADO, WHATSAPP, NOTAS, DESCRIPCION, DINNER_KEY, SUCURSAL, SINCRONIZADO)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          cliente.nombre,
          cliente.telefono ?? null,
          cliente.correo ?? null,
          cliente.direccion ?? null,
          cliente.ciudad ?? null,
          cliente.estado ?? null,
          cliente.whatsapp ?? null,
          cliente.notas ?? null,
          cliente.descripcion ?? null,
          0,
          qrData,
        ],
      ),
    );
  }

  static async updateCliente(id, cliente) {
    const data = {
      nombre: cliente.nombre,
      telefono: cliente.telefono ?? null,
      correo: cliente.correo ?? null,
      direccion: cliente.direccion ?? null,
      estado: cliente.estado ?? null,
      whatsapp: cliente.whatsapp ?? null,
      notas: cliente.notas ?? null,
      descripcion: cliente.descripcion ?? null,
    };

    return withDb("Clientes.updateCliente", (db) =>
      db.runAsync(
        `
        UPDATE CLIENTES
        SET
          NOMBRE = ?,
          TELEFONO = ?,
          CORREO = ?,
          DIRECCION = ?,
          ESTADO = ?,
          WHATSAPP = ?,
          NOTAS = ?,
          DESCRIPCION = ?,
          SINCRONIZADO = 0
        WHERE ID = ?
      `,
        [
          data.nombre,
          data.telefono,
          data.correo,
          data.direccion,
          data.estado,
          data.whatsapp,
          data.notas,
          data.descripcion,
          id,
        ],
      ),
    );
  }

  /** Clientes con SINCRONIZADO = 0 (editados o creados localmente) */
  static async getClientesPendientes() {
    return withDb("Clientes.getClientesPendientes", (db) =>
      db.getAllAsync(
        `SELECT ID, UUID, NOMBRE, TELEFONO, CORREO, DIRECCION,
                        CIUDAD, ESTADO, WHATSAPP, DESCRIPCION, SUCURSAL
                 FROM CLIENTES WHERE SINCRONIZADO = 0`,
      ),
    );
  }

  /** UUID del negocio (para el campo businessId del payload) */
  static async getBusinessId() {
    return withDb("Clientes.getBusinessId", async (db) => {
      const row = await db.getFirstAsync(`SELECT UUID FROM NEGOCIO LIMIT 1`);
      return row?.UUID ?? null;
    });
  }

  /** UUID real de la sucursal asociado al código QR de la sesión actual. */
  static async getSucursalId() {
    const qrCode = await AsyncStorage.getItem("qrCode");

    if (!qrCode) return null;

    return withDb("Clientes.getSucursalId", async (db) => {
      const row = await db.getFirstAsync(
        `SELECT UUID FROM SUCURSAL WHERE CODIGO_QR = ? LIMIT 1`,
        [qrCode],
      );
      return row?.UUID ?? null;
    });
  }

  /** Marca como SINCRONIZADO = 1 por UUID (clientes que ya existían en servidor) */
  static async marcarSincronizadosPorUUID(uuids) {
    if (!uuids?.length) return;
    const ph = uuids.map(() => "?").join(",");
    return withDb("Clientes.marcarSincronizadosPorUUID", (db) =>
      db.runAsync(
        `UPDATE CLIENTES SET SINCRONIZADO = 1 WHERE UUID IN (${ph})`,
        uuids,
      ),
    );
  }

  /** Elimina clientes locales sin UUID (recién creados, ya enviados al servidor) */
  static async eliminarClientesSinUUID() {
    return withDb("Clientes.eliminarClientesSinUUID", (db) =>
      db.runAsync(`DELETE FROM CLIENTES WHERE UUID IS NULL`),
    );
  }
}
