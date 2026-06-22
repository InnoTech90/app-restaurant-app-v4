// import * as SQLite from "expo-sqlite";

// let _db = null;

// export async function getDb() {
//     if (!_db) _db = await SQLite.openDatabaseAsync("APP_RESTAURANT_DB.db");
//     return _db;
// }

// /**
//  * Ejecuta una operación sobre la BD con retry automático.
//  * Si Android invalida el handle nativo (NullPointerException),
//  * se descarta la conexión, se abre una nueva y se reintenta.
//  */
// export async function withDb(operation) {
//     try {
//         const db = await getDb();
//         return await operation(db);
//     } catch (error) {
//         const msg = error?.message ?? "";
//         if (msg.includes("NativeDatabase") || msg.includes("NullPointerException")) {
//             _db = null;
//             const db = await getDb();
//             return await operation(db);
//         }
//         throw error;
//     }
// }
import * as SQLite from "expo-sqlite";

let _db = null;
let _dbPromise = null;

// Cola global
let _queue = Promise.resolve();

// Estadísticas
let _operationId = 0;
let _pendingOperations = 0;

export async function getDb() {
    if (_db) {
        return _db;
    }

    if (!_dbPromise) {
        console.log("🟢 SQLITE: Abriendo conexión...");

        _dbPromise = SQLite.openDatabaseAsync(
            "APP_RESTAURANT_DB.db"
        );
    }

    _db = await _dbPromise;

    console.log("✅ SQLITE: Conexión lista");

    return _db;
}

export async function resetDb() {
    console.warn("🔄 SQLITE: Reiniciando conexión");

    _db = null;
    _dbPromise = null;
}

export function withDb(operation) {

    const currentOperation = ++_operationId;

    const execute = async () => {

        _pendingOperations++;

        console.log(
            `🚀 SQL START #${currentOperation} | Pendientes: ${_pendingOperations}`
        );

        const start = Date.now();

        try {

            const db = await getDb();

            const result = await operation(db);

            const duration = Date.now() - start;

            console.log(
                `✅ SQL END #${currentOperation} | ${duration}ms | Pendientes: ${_pendingOperations - 1}`
            );

            return result;

        } catch (error) {

            const duration = Date.now() - start;

            console.error(
                `❌ SQL ERROR #${currentOperation} | ${duration}ms`,
                error
            );

            const msg = error?.message ?? "";

            const isNativeError =
                msg.includes("NativeDatabase") ||
                msg.includes("NullPointerException");

            if (isNativeError) {

                console.warn(
                    `⚠️ SQL RETRY #${currentOperation} - Reconectando SQLite`
                );

                await resetDb();

                try {

                    const db = await getDb();

                    const result = await operation(db);

                    console.log(
                        `✅ SQL RETRY OK #${currentOperation}`
                    );

                    return result;

                } catch (retryError) {

                    console.error(
                        `💥 SQL RETRY FAILED #${currentOperation}`,
                        retryError
                    );

                    throw retryError;
                }
            }

            throw error;

        } finally {

            _pendingOperations--;

            console.log(
                `📊 SQL QUEUE STATUS | Pendientes: ${_pendingOperations}`
            );
        }
    };

    _queue = _queue
        .then(execute)
        .catch((error) => {
            console.error(
                "💥 SQL QUEUE ERROR",
                error
            );

            throw error;
        });

    return _queue;
}
