// import * as SQLite from "expo-sqlite";

// let _db = null;
// let _dbPromise = null;

// // Cola global
// let _queue = Promise.resolve();

// // Estadísticas
// let _operationId = 0;
// let _pendingOperations = 0;

// function isNativeDbError(error) {
//   const msg = error?.message ?? "";
//   return msg.includes("NativeDatabase") || msg.includes("NullPointerException");
// }

// export async function getDb() {
//   if (_db) {
//     return _db;
//   }

//   if (!_dbPromise) {
//     console.log("🟢 SQLITE: Abriendo conexión...");

//     _dbPromise = SQLite.openDatabaseAsync("APP_RESTAURANT_DB.db");
//   }

//   try {
//     _db = await _dbPromise;
//   } catch (error) {
//     _db = null;
//     _dbPromise = null;
//     throw error;
//   }

//   console.log("✅ SQLITE: Conexión lista");

//   return _db;
// }

// export async function resetDb() {
//   console.warn("🔄 SQLITE: Reiniciando conexión");

//   const previousDb = _db;

//   _db = null;
//   _dbPromise = null;

//   if (previousDb?.closeAsync) {
//     try {
//       await previousDb.closeAsync();
//       console.log("🧹 SQLITE: Conexión previa cerrada");
//     } catch (closeError) {
//       console.warn("⚠️ SQLITE: No se pudo cerrar conexión previa", closeError);
//     }
//   }
// }

// export function withDb(operation) {
//   const currentOperation = ++_operationId;

//   const execute = async () => {
//     _pendingOperations++;

//     console.log(
//       `🚀 SQL START #${currentOperation} | Pendientes: ${_pendingOperations}`,
//     );

//     const start = Date.now();

//     try {
//       const db = await getDb();

//       const result = await operation(db);

//       const duration = Date.now() - start;

//       console.log(
//         `✅ SQL END #${currentOperation} | ${duration}ms | Pendientes: ${_pendingOperations - 1}`,
//       );

//       return result;
//     } catch (error) {
//       const duration = Date.now() - start;

//       console.error(`❌ SQL ERROR #${currentOperation} | ${duration}ms`, error);

//       const isNativeError = isNativeDbError(error);

//       if (isNativeError) {
//         let lastRetryError = error;

//         for (let attempt = 1; attempt <= 2; attempt++) {
//           console.warn(
//             `⚠️ SQL RETRY #${currentOperation}.${attempt} - Reconectando SQLite`,
//           );

//           await resetDb();

//           try {
//             const db = await getDb();
//             const result = await operation(db);

//             console.log(`✅ SQL RETRY OK #${currentOperation}.${attempt}`);

//             return result;
//           } catch (retryError) {
//             lastRetryError = retryError;
//             const shouldRetry = attempt < 2 && isNativeDbError(retryError);

//             if (!shouldRetry) {
//               console.error(
//                 `💥 SQL RETRY FAILED #${currentOperation}.${attempt}`,
//                 retryError,
//               );
//               throw retryError;
//             }
//           }
//         }

//         throw lastRetryError;
//       }

//       throw error;
//     } finally {
//       _pendingOperations--;

//       console.log(`📊 SQL QUEUE STATUS | Pendientes: ${_pendingOperations}`);
//     }
//   };

//   _queue = _queue
//     .catch(async (error) => {
//       console.error("💥 SQL QUEUE ERROR", error);

//       if (isNativeDbError(error)) {
//         console.warn("⚠️ SQL QUEUE RECOVERY - Reiniciando conexión");
//         await resetDb();
//       }
//     })
//     .then(execute);

//   return _queue;
// }

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
