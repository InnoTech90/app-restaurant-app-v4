/**
 * Migraciones incrementales de columnas en tablas existentes.
 * Se ejecutan en cada inicialización de la BD (CREATE TABLE IF NOT EXISTS no agrega columnas).
 */

const ensureColumn = async (db, tableName, columnName, alterSql) => {
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [tableName],
  );
  if (!tableExists) return;

  const columns = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
  if (columns.some((col) => col.name === columnName)) return;

  console.log(`  Migración: ${tableName}.${columnName}`);
  await db.runAsync(alterSql);
};

export async function runDatabaseMigrations(db) {
  console.log("🔄 Verificando migraciones de columnas...");

  await ensureColumn(
    db,
    "COMANDA_ARTICULO",
    "IMPRESO",
    "ALTER TABLE COMANDA_ARTICULO ADD COLUMN IMPRESO INTEGER DEFAULT 0",
  );

  await ensureColumn(
    db,
    "COMANDA",
    "IMPUESTOS",
    "ALTER TABLE COMANDA ADD COLUMN IMPUESTOS REAL DEFAULT 0",
  );

  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "COSTO_ENVIO_ES_PCT",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN COSTO_ENVIO_ES_PCT INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "IMPUESTOS_ES_PCT",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN IMPUESTOS_ES_PCT INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "DESCUENTOS_ES_PCT",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN DESCUENTOS_ES_PCT INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "PROTEGER_VENTAS",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN PROTEGER_VENTAS INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "NIP_FINALIZAR_TICKET",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN NIP_FINALIZAR_TICKET INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "MODO_RESTRICTIVO",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN MODO_RESTRICTIVO INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "HABILITAR_EDICION_TICKET",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN HABILITAR_EDICION_TICKET INTEGER DEFAULT 1",
  );
  await ensureColumn(
    db,
    "CONFIGURACIONES",
    "NIP",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN NIP INTEGER",
  );

  await ensureColumn(
    db,
    "GERENTES",
    "UUID",
    "ALTER TABLE GERENTES ADD COLUMN UUID NVARCHAR",
  );
  await ensureColumn(
    db,
    "GERENTES",
    "ACTIVO",
    "ALTER TABLE GERENTES ADD COLUMN ACTIVO INTEGER DEFAULT 1",
  );

  try {
    await db.runAsync(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_gerentes_uuid ON GERENTES(UUID)`,
    );
  } catch (e) {
    console.warn("  ⚠️  idx_gerentes_uuid:", e?.message ?? e);
  }

  console.log("✅ Migraciones de columnas verificadas");
}
