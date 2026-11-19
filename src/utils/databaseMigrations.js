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
    "COMANDA_ARTICULO",
    "DESCUENTO",
    "ALTER TABLE COMANDA_ARTICULO ADD COLUMN DESCUENTO REAL DEFAULT 0",
  );

  await ensureColumn(
    db,
    "HISTORIAL_CAJA",
    "FECHA_CIERRE",
    "ALTER TABLE HISTORIAL_CAJA ADD COLUMN FECHA_CIERRE DATETIME",
  );
  await ensureColumn(
    db,
    "HISTORIAL_CAJA",
    "CONCEPTO",
    "ALTER TABLE HISTORIAL_CAJA ADD COLUMN CONCEPTO NVARCHAR",
  );
  await ensureColumn(
    db,
    "HISTORIAL_CAJA",
    "FONDO",
    "ALTER TABLE HISTORIAL_CAJA ADD COLUMN FONDO REAL",
  );

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS MOVIMIENTO_CAJA (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ID_CAJA INTEGER,
      TIPO NVARCHAR,
      MONTO REAL,
      CONCEPTO NVARCHAR,
      FECHA DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureColumn(
    db,
    "MOVIMIENTO_CAJA",
    "CONCEPTO",
    "ALTER TABLE MOVIMIENTO_CAJA ADD COLUMN CONCEPTO NVARCHAR",
  );
  await ensureColumn(
    db,
    "HISTORIAL_CAJA",
    "UUID",
    "ALTER TABLE HISTORIAL_CAJA ADD COLUMN UUID NVARCHAR",
  );
  await ensureColumn(
    db,
    "HISTORIAL_CAJA",
    "SINCRONIZADO",
    "ALTER TABLE HISTORIAL_CAJA ADD COLUMN SINCRONIZADO INTEGER DEFAULT 0",
  );
  await ensureColumn(
    db,
    "HISTORIAL_CAJA",
    "CIERRE_SINCRONIZADO",
    "ALTER TABLE HISTORIAL_CAJA ADD COLUMN CIERRE_SINCRONIZADO INTEGER DEFAULT 1",
  );
  await ensureColumn(
    db,
    "MOVIMIENTO_CAJA",
    "UUID",
    "ALTER TABLE MOVIMIENTO_CAJA ADD COLUMN UUID NVARCHAR",
  );
  await ensureColumn(
    db,
    "MOVIMIENTO_CAJA",
    "SINCRONIZADO",
    "ALTER TABLE MOVIMIENTO_CAJA ADD COLUMN SINCRONIZADO INTEGER DEFAULT 0",
  );

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS CAJA_VENTA (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ID_CAJA INTEGER,
      ID_COMANDA INTEGER,
      METODO NVARCHAR,
      MONTO REAL,
      ES_EFECTIVO INTEGER DEFAULT 0,
      FECHA DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
    "ALTER TABLE CONFIGURACIONES ADD COLUMN NIP_FINALIZAR_TICKET INTEGER DEFAULT 1",
  );
  await db.runAsync(
    `UPDATE CONFIGURACIONES
     SET NIP_FINALIZAR_TICKET = 1
     WHERE NIP_FINALIZAR_TICKET IS NULL`,
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
    "CONFIGURACIONES",
    "BIENVENIDA_INICIO_DIA",
    "ALTER TABLE CONFIGURACIONES ADD COLUMN BIENVENIDA_INICIO_DIA INTEGER DEFAULT 1",
  );
  await db.runAsync(
    `UPDATE CONFIGURACIONES
     SET BIENVENIDA_INICIO_DIA = 1
     WHERE BIENVENIDA_INICIO_DIA IS NULL`,
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

  await ensureColumn(
    db,
    "COMANDA",
    "ORIGEN",
    "ALTER TABLE COMANDA ADD COLUMN ORIGEN NVARCHAR DEFAULT 'POS'",
  );
  await ensureColumn(
    db,
    "COMANDA",
    "ID_PEDIDO_DIGITAL",
    "ALTER TABLE COMANDA ADD COLUMN ID_PEDIDO_DIGITAL NVARCHAR",
  );
  await ensureColumn(
    db,
    "COMANDA",
    "TIPO_ENTREGA",
    "ALTER TABLE COMANDA ADD COLUMN TIPO_ENTREGA NVARCHAR",
  );

  await ensureColumn(
    db,
    "SUCURSAL",
    "LOGO",
    "ALTER TABLE SUCURSAL ADD COLUMN LOGO NVARCHAR",
  );

  try {
    await db.runAsync(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_comanda_pedido_digital
       ON COMANDA(ID_PEDIDO_DIGITAL)
       WHERE ID_PEDIDO_DIGITAL IS NOT NULL`,
    );
  } catch (e) {
    console.warn("  ⚠️  idx_comanda_pedido_digital:", e?.message ?? e);
  }

  await ensurePerformanceIndexes(db);

  console.log("✅ Migraciones de columnas verificadas");
}

/**
 * Índices para que la app aguante cargas pesadas (miles de ventas y artículos).
 * Sin ellos, Ventas hacía subconsultas por cada comanda recorriendo toda
 * COMANDA_ARTICULO: con 20,000 ventas la consulta pasaba de 10 minutos;
 * con índices tarda ~0.2 s. `IF NOT EXISTS` = seguro en bases con datos.
 */
const PERFORMANCE_INDEXES = [
  ["idx_comanda_articulo_comanda", "COMANDA_ARTICULO(ID_COMANDA)"],
  ["idx_comanda_complemento_ca", "COMANDA_COMPLEMENTO(ID_COMANDA_ARTICULO)"],
  ["idx_comanda_pagos_comanda", "COMANDA_PAGOS(ID_COMANDA)"],
  ["idx_cuenta_dividida_comanda", "COMANDA_PAGO_CUENTA_DIVIDIDA(ID_COMANDA)"],
  ["idx_comanda_movimientos_comanda", "COMANDA_MOVIMIENTOS(ID_COMANDA)"],
  ["idx_comanda_activo_estatus", "COMANDA(ACTIVO, ESTATUS)"],
  ["idx_comanda_mesa_activo", "COMANDA(ID_MESA, ACTIVO)"],
  ["idx_comanda_sincronizado", "COMANDA(SINCRONIZADO)"],
  ["idx_comanda_fecha", "COMANDA(FECHA)"],
  ["idx_caja_venta_caja", "CAJA_VENTA(ID_CAJA)"],
  ["idx_caja_venta_comanda", "CAJA_VENTA(ID_COMANDA)"],
  ["idx_movimiento_caja_caja", "MOVIMIENTO_CAJA(ID_CAJA)"],
  ["idx_articulo_grupo", "ARTICULO(ID_GRUPO)"],
  ["idx_articulo_uuid", "ARTICULO(UUID)"],
  ["idx_grupo_articulos_menu", "GRUPO_ARTICULOS(ID_MENU)"],
  ["idx_grupo_complementos_articulo", "GRUPO_COMPLEMENTOS(ID_ARTICULO)"],
  ["idx_complemento_grupo", "COMPLEMENTO(ID_GRUPO_COMP)"],
  ["idx_mesa_uuid", "MESA(UUID)"],
  ["idx_clientes_nombre", "CLIENTES(NOMBRE)"],
  ["idx_mp_sucursal_mp", "MATERIA_PRIMA_SUCURSAL(ID_MATERIA_PRIMA)"],
  ["idx_registro_gasto_fecha", "REGISTRO_GASTO(FECHA)"],
];

async function ensurePerformanceIndexes(db) {
  for (const [nombre, definicion] of PERFORMANCE_INDEXES) {
    try {
      await db.runAsync(`CREATE INDEX IF NOT EXISTS ${nombre} ON ${definicion}`);
    } catch (e) {
      // Tabla/columna ausente en una base vieja: no bloquear el arranque.
      console.warn(`  Índice ${nombre} omitido:`, e?.message ?? e);
    }
  }
}
