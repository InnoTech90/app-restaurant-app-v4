/**
 * DatabaseInitializer
 * Maneja la inicialización segura del esquema de base de datos.
 * - Verifica existencia de tablas sin usar DROP
 * - Crea solo las tablas faltantes
 * - Rastrea versión del esquema
 * - Ejecuta migraciones si es necesario
 */

import { DatabaseSchema } from "./DatabaseSchema";

let initializationPromise = null;
let isInitialized = false;

export class DatabaseInitializer {
  /**
   * Inicializa el esquema de base de datos de forma segura.
   * - Ejecuta una sola vez durante el ciclo de vida de la app
   * - Crea tablas faltantes
   * - Preserva datos existentes
   */
  static async initialize(db) {
    if (isInitialized) {
      return {
        success: true,
        message: "Database already initialized",
        timestamp: new Date().toISOString(),
      };
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = this._performInitialization(db);
    return initializationPromise;
  }

  static async _performInitialization(db) {
    const startTime = Date.now();
    const results = {
      success: false,
      message: "",
      timestamp: new Date().toISOString(),
      tablesCreated: [],
      tablesExisted: [],
      errors: [],
      totalTime: 0,
    };

    try {
      console.log("🔧 Iniciando inicialización de base de datos...");

      // Crear tabla de versionado si no existe
      await db.runAsync(DatabaseSchema.tables._SCHEMA_VERSION.ddl);

      // Verificar versión actual
      const currentVersion = await this._getCurrentSchemaVersion(db);
      console.log(`📊 Versión actual del esquema: ${currentVersion}`);

      // Obtener tablas en orden de dependencias
      const tablesToCreate = DatabaseSchema.getTableCreationOrder();

      // Verificar y crear tablas necesarias
      for (const tableDefinition of tablesToCreate) {
        try {
          const exists = await this._tableExists(db, tableDefinition.name);

          if (exists) {
            console.log(`✅ Tabla ${tableDefinition.name} ya existe`);
            results.tablesExisted.push(tableDefinition.name);
          } else {
            console.log(`🆕 Creando tabla ${tableDefinition.name}...`);
            await db.runAsync(tableDefinition.ddl);
            results.tablesCreated.push(tableDefinition.name);
            console.log(`✅ Tabla ${tableDefinition.name} creada exitosamente`);
          }
        } catch (error) {
          const errorMsg = `Error al procesar tabla ${tableDefinition.name}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          results.errors.push({
            table: tableDefinition.name,
            error: error.message,
          });
          throw error;
        }
      }

      // Ejecutar migraciones si es necesario
      if (currentVersion < DatabaseSchema.version) {
        console.log(
          `🔄 Ejecutando migraciones de versión ${currentVersion} a ${DatabaseSchema.version}...`,
        );
        await this._executeMigrations(
          db,
          currentVersion,
          DatabaseSchema.version,
        );
        await this._updateSchemaVersion(db, DatabaseSchema.version);
        console.log(`✅ Migraciones completadas`);
      }

      // Insertar datos de configuración inicial (solo si están vacíos)
      await this._initializeDefaultData(db);

      results.success = true;
      results.totalTime = Date.now() - startTime;
      results.message = `Inicialización exitosa en ${results.totalTime}ms. Tablas creadas: ${results.tablesCreated.length}, Tablas existentes: ${results.tablesExisted.length}`;

      console.log("✅ Base de datos inicializada correctamente");
      console.log(results.message);

      isInitialized = true;
      return results;
    } catch (error) {
      results.totalTime = Date.now() - startTime;
      results.message = `Error en inicialización: ${error.message}`;
      console.error(`❌ ${results.message}`);
      throw error;
    }
  }

  /**
   * Verifica si una tabla existe en la base de datos
   */
  static async _tableExists(db, tableName) {
    try {
      const result = await db.getFirstAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName],
      );
      return !!result;
    } catch (error) {
      console.error(`Error al verificar tabla ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Obtiene la versión actual del esquema
   */
  static async _getCurrentSchemaVersion(db) {
    try {
      const result = await db.getFirstAsync(
        `SELECT MAX(VERSION) as version FROM _SCHEMA_VERSION`,
      );
      return result?.version ?? 0;
    } catch (error) {
      console.log("Tabla de versión no existe aún, se creará:", error.message);
      return 0;
    }
  }

  /**
   * Actualiza la versión del esquema
   */
  static async _updateSchemaVersion(db, newVersion) {
    try {
      await db.runAsync(
        `INSERT INTO _SCHEMA_VERSION (VERSION, DESCRIPTION) VALUES (?, ?)`,
        [newVersion, `Schema upgrade to version ${newVersion}`],
      );
      console.log(`📊 Versión del esquema actualizada a ${newVersion}`);
    } catch (error) {
      console.error("Error al actualizar versión del esquema:", error);
      throw error;
    }
  }

  /**
   * Ejecuta migraciones necesarias
   */
  static async _executeMigrations(db, fromVersion, toVersion) {
    // Aquí se pueden definir migraciones específicas por versión
    for (let v = fromVersion + 1; v <= toVersion; v++) {
      console.log(`Ejecutando migración v${v}...`);

      switch (v) {
        case 1:
          // Migración v1: Agregar columnas faltantes a CLIENTES si existen
          await this._safeMigration(
            db,
            "CLIENTES",
            "CIUDAD NVARCHAR",
            "ALTER TABLE CLIENTES ADD COLUMN CIUDAD NVARCHAR",
          );
          await this._safeMigration(
            db,
            "CLIENTES",
            "ESTADO NVARCHAR",
            "ALTER TABLE CLIENTES ADD COLUMN ESTADO NVARCHAR",
          );
          await this._safeMigration(
            db,
            "CLIENTES",
            "WHATSAPP NVARCHAR",
            "ALTER TABLE CLIENTES ADD COLUMN WHATSAPP NVARCHAR",
          );

          // Migración v1: Agregar STOCK_ANTERIOR a MATERIA_PRIMA_SUCURSAL
          await this._safeMigration(
            db,
            "MATERIA_PRIMA_SUCURSAL",
            "STOCK_ANTERIOR REAL",
            "ALTER TABLE MATERIA_PRIMA_SUCURSAL ADD COLUMN STOCK_ANTERIOR REAL",
          );

          // Migración v1: Agregar SINCRONIZADO a REGISTRO_GASTO
          await this._safeMigration(
            db,
            "REGISTRO_GASTO",
            "SINCRONIZADO INTEGER",
            "ALTER TABLE REGISTRO_GASTO ADD COLUMN SINCRONIZADO INTEGER DEFAULT 0",
          );
          break;

        default:
          console.log(`No hay migraciones definidas para v${v}`);
      }
    }
  }

  /**
   * Intenta ejecutar una migración de forma segura (ignora si la columna ya existe)
   */
  static async _safeMigration(db, tableName, columnDef, migrationSQL) {
    try {
      // Primero verifica si la tabla existe
      const tableExists = await this._tableExists(db, tableName);
      if (!tableExists) {
        console.log(`⏭️  Tabla ${tableName} no existe aún, saltando migración`);
        return;
      }

      // Verifica si la columna ya existe
      const columnName = columnDef.split(" ")[0];
      const result = await db.getFirstAsync(`PRAGMA table_info(${tableName})`);

      const hasColumn = await db.getFirstAsync(
        `SELECT 1 FROM pragma_table_info('${tableName}') WHERE name='${columnName}'`,
      );

      if (!hasColumn) {
        console.log(`  Agregando columna ${columnName} a ${tableName}...`);
        await db.runAsync(migrationSQL);
        console.log(`  ✅ Columna agregada`);
      } else {
        console.log(`  ℹ️  Columna ${columnName} ya existe en ${tableName}`);
      }
    } catch (error) {
      console.error(
        `  ⚠️  Error en migración de ${tableName}.${columnDef}:`,
        error.message,
      );
      // No lanzar error para no interrumpir la inicialización
    }
  }

  /**
   * Inicializa datos por defecto en tablas de configuración
   */
  static async _initializeDefaultData(db) {
    try {
      // Insertar tipos de movimiento de inventario si están vacíos
      const tiposMovimiento = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM COMANDA_MOVIMIENTO_TIPO`,
      );

      if (tiposMovimiento.count === 0) {
        console.log("📝 Insertando tipos de movimiento de comanda...");
        await db.runAsync(`
          INSERT OR IGNORE INTO COMANDA_MOVIMIENTO_TIPO (TIPO, ACTIVO) VALUES
          ('IMPRESION_TICKET', 1),
          ('ELIMINACION_ARTICULO', 1),
          ('INCREMENTAR_ARTICULO', 1),
          ('DISMINUIR_ARTICULO', 1)
        `);
      }

      // Insertar tamaños de fuentes si están vacíos
      const tamanios = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM TAMAÑO_FUENTES`,
      );

      if (tamanios.count === 0) {
        console.log("📝 Insertando tamaños de fuentes...");
        await db.runAsync(`
          INSERT OR IGNORE INTO TAMAÑO_FUENTES (NOMBRE, VALOR, ICONO, ACTIVO) VALUES 
          ('Pequeña', 8, 'text-size', 1),
          ('Mediana', 12, 'text-size', 1),
          ('Grande', 16, 'text-size', 1)
        `);
      }

      // Insertar formatos de pago si están vacíos
      const formatos = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM FORMATO_PAGO`,
      );

      if (formatos.count === 0) {
        console.log("📝 Insertando formatos de pago...");
        await db.runAsync(`
          INSERT OR IGNORE INTO FORMATO_PAGO (NOMBRE, VALOR, ACTIVO) VALUES 
          ('Efectivo', 1, 1),
          ('Tarjeta', 1, 1),
          ('Transferencia', 1, 1),
          ('Mercado pago', 1, 1),
          ('Clip', 1, 1),
          ('Izettle', 1, 1),
          ('Pendiente', 1, 1)
        `);
      }
    } catch (error) {
      console.warn(
        "⚠️  Error al inicializar datos por defecto:",
        error.message,
      );
      // No interrumpir si hay error aquí
    }
  }

  /**
   * Verifica el estado actual de la base de datos
   */
  static async getSchemaStatus(db) {
    try {
      const tableList = await db.getAllAsync(
        `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
      );

      const currentVersion = await this._getCurrentSchemaVersion(db);

      return {
        isInitialized,
        schemaVersion: currentVersion,
        targetVersion: DatabaseSchema.version,
        tables: tableList.map((t) => t.name),
        totalTables: tableList.length,
      };
    } catch (error) {
      console.error("Error al obtener estado del esquema:", error);
      throw error;
    }
  }

  /**
   * Reset para testing (borra todas las tablas) - ¡USAR SOLO EN DESARROLLO!
   */
  static async reset(db) {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Reset solo permitido en desarrollo");
    }

    console.warn("⚠️  RESETEANDO BASE DE DATOS...");
    const tables = await db.getAllAsync(
      `SELECT name FROM sqlite_master WHERE type='table'`,
    );

    for (const table of tables) {
      if (table.name !== "_SCHEMA_VERSION") {
        await db.runAsync(`DROP TABLE IF EXISTS ${table.name}`);
        console.log(`Tabla ${table.name} eliminada`);
      }
    }

    isInitialized = false;
    initializationPromise = null;
    console.log("✅ Base de datos reseteada");
  }
}
