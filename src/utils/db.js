import * as SQLite from "expo-sqlite";

let db = null;
let dbPromise = null;

// Cola global
let queue = Promise.resolve();

// Estadísticas
let operationId = 0;
let pendingOperations = 0;
let dbId = 0;

export async function getDb() {
  if (db) {
    console.log("♻️ Reutilizando DB");
    console.log("📂 PATH:", db.databasePath);
    return db;
  }

  if (!dbPromise) {
    dbId++;
    console.log("🆕 SQLITE: Creando nueva conexión ID:", dbId);
    dbPromise = SQLite.openDatabaseAsync("APP_RESTAURANT_DB.db");
  }

  try {
    db = await dbPromise;

    console.log("✅ SQLITE: Conexión lista");
    console.log("📂 PATH:", db.databasePath);

    return db;
  } catch (error) {
    console.error("❌ Error abriendo SQLite", error);

    db = null;
    dbPromise = null;

    throw error;
  }
}

export function withDb(name = "", operation) {
  const currentOperation = ++operationId;

  queue = queue
    .catch((error) => {
      console.error("💥 SQL QUEUE ERROR", error);
    })
    .then(async () => {
      pendingOperations++;

      console.log(
        `🚀 SQL START #${currentOperation} | Pendientes: ${pendingOperations}`,
      );

      const start = Date.now();

      try {
        const database = await getDb();

        console.log("════════════════════════════");
        console.log(`📝 SQL OPERATION #${currentOperation} | ${name}`);
        console.log("DB INSTANCE:", database);
        console.log("DATABASE PATH:", database.databasePath);

        const result = await operation(database);

        console.log(
          `✅ SQL END #${currentOperation} | ${Date.now() - start}ms | Pendientes: ${pendingOperations - 1}`,
        );

        return result;
      } catch (error) {
        console.error(
          `❌ SQL ERROR #${currentOperation} | ${Date.now() - start}ms`,
          error,
        );

        throw error;
      } finally {
        pendingOperations--;

        console.log(`📊 SQL QUEUE STATUS | Pendientes: ${pendingOperations}`);
      }
    });

  return queue;
}
