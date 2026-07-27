import * as SQLite from "expo-sqlite";

let db = null;
let dbPromise = null;

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
