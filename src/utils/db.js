import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import { DatabaseInitializer } from "./DatabaseInitializer";
import { DatabaseSchema } from "./DatabaseSchema";

let db = null;
let dbPromise = null;
let schemaInitPromise = null;

// Cola global
let queue = Promise.resolve();

// Estadísticas
let operationId = 0;

export async function getDb() {
  if (db) {
    return db;
  }

  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("APP_RESTAURANT_DB.db");
  }

  try {
    db = await dbPromise;

    return db;
  } catch (error) {
    console.error("❌ Error abriendo SQLite", error);

    db = null;
    dbPromise = null;

    throw error;
  }
}

/**
 * Inicializa el esquema de base de datos.
 * Debe llamarse después de autenticarse y antes de usar datos.
 * Es seguro llamarla múltiples veces - la inicialización ocurre una sola vez.
 */
export async function initializeSchema() {
  if (schemaInitPromise) {
    return schemaInitPromise;
  }

  schemaInitPromise = (async () => {
    try {
      console.log("🔧 Inicializando esquema de base de datos...");
      const database = await getDb();
      const result = await DatabaseInitializer.initialize(database);
      console.log("✅ Esquema inicializado correctamente", result);
      return result;
    } catch (error) {
      console.error("❌ Error al inicializar esquema:", error);
      throw error;
    }
  })();

  return schemaInitPromise;
}

/**
 * Obtiene el estado actual del esquema de base de datos
 */
export async function getSchemaStatus() {
  try {
    const database = await getDb();
    return await DatabaseInitializer.getSchemaStatus(database);
  } catch (error) {
    console.error("Error al obtener estado del esquema:", error);
    throw error;
  }
}

/**
 * Elimina los datos locales y conserva las tablas para que la siguiente
 * autenticación pueda descargarlos nuevamente desde la API.
 */
export async function resetLocalData() {
  return withDb("resetLocalData", async (database) => {
    const tables = DatabaseSchema.getTableCreationOrder()
      .map((table) => table.name)
      .filter((tableName) => tableName !== "_SCHEMA_VERSION")
      .reverse();

    await database.execAsync("BEGIN TRANSACTION");
    try {
      for (const tableName of tables) {
        await database.runAsync(`DELETE FROM "${tableName}"`);
      }
      await database.execAsync("COMMIT");

      await AsyncStorage.multiRemove([
        "deviceKey",
        "qrCode",
        "MesaSeleccionada",
        "montoRecibido",
        "authData",
        "gerenteSesion",
      ]);

      console.log("✅ Datos locales eliminados correctamente");
    } catch (error) {
      await database.execAsync("ROLLBACK");
      throw error;
    }
  });
}

export function withDb(name = "", operation) {
  const currentOperation = ++operationId;

  queue = queue
    .catch((error) => {
      console.error("💥 SQL QUEUE ERROR", error);
    })
    .then(async () => {
      const start = Date.now();

      try {
        const database = await getDb();

        const result = await operation(database);

        return result;
      } catch (error) {
        console.error(
          `❌ SQL ERROR #${currentOperation} | ${Date.now() - start}ms`,
          error,
        );

        throw error;
      } finally {
      }
    });

  return queue;
}
