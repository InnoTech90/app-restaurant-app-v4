/**
 * DatabaseSchema
 * Centraliza todas las definiciones de tablas de la aplicación.
 * Proporciona metadatos y DDL para cada tabla.
 */

export const DatabaseSchema = {
  version: 1,

  tables: {
    // Tablas base del sistema
    DEVICE: {
      name: "DEVICE",
      ddl: `
        CREATE TABLE IF NOT EXISTS DEVICE (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          DEVICE_KEY NVARCHAR,
          RECIBE_PEDIDOS INTEGER,
          ESTATUS NVARCHAR,
          ACTIVO INTEGER
        )
      `,
      dependencies: [],
    },

    SUCURSAL: {
      name: "SUCURSAL",
      ddl: `
        CREATE TABLE IF NOT EXISTS SUCURSAL (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          CODIGO_QR NVARCHAR,
          DIRECCION NVARCHAR,
          LAT NVARCHAR,
          LNG NVARCHAR,
          TELEFONO NVARCHAR,
          WHATSAPP NVARCHAR,
          FACEBOK NVARCHAR,
          INSTAGRAM NVARCHAR,
          TIKTOK NVARCHAR,
          TWITTER NVARCHAR,
          WEBSITE NVARCHAR
        )
      `,
      dependencies: [],
    },

    NEGOCIO: {
      name: "NEGOCIO",
      ddl: `
        CREATE TABLE IF NOT EXISTS NEGOCIO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE_NEGOCIO NVARCHAR,
          RAZON_SOCIAL NVARCHAR,
          RFC NVARCHAR,
          TELEFONO NVARCHAR,
          CODIGO_POSTAL NVARCHAR,
          DIRECCION NVARCHAR,
          LOGO NVARCHAR,
          NOTIFICAR_INVENTARIO INTEGER,
          ESTATUS INTEGER
        )
      `,
      dependencies: [],
    },

    PLAN: {
      name: "PLAN",
      ddl: `
        CREATE TABLE IF NOT EXISTS PLAN (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          COSTO NVARCHAR,
          CANTIDAD_DISPOSITIVOS INTEGER
        )
      `,
      dependencies: [],
    },

    PUNTOS_IMPRESION: {
      name: "PUNTOS_IMPRESION",
      ddl: `
        CREATE TABLE IF NOT EXISTS PUNTOS_IMPRESION (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_SUCURSAL NVARCHAR,
          NOMBRE NVARCHAR,
          ID_IMPRESORA NVARCHAR
        )
      `,
      dependencies: ["SUCURSAL"],
    },

    BLUETOOTH_ENCONTRADOS: {
      name: "BLUETOOTH_ENCONTRADOS",
      ddl: `
        CREATE TABLE IF NOT EXISTS BLUETOOTH_ENCONTRADOS (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ADDRESS NVARCHAR UNIQUE,
          NAME NVARCHAR,
          TIPO NVARCHAR
        )
      `,
      dependencies: [],
    },

    GERENTES: {
      name: "GERENTES",
      ddl: `
        CREATE TABLE IF NOT EXISTS GERENTES (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NAME NVARCHAR,
          NIP NVARCHAR,
          ACTIVO INTEGER DEFAULT 1
        )
      `,
      dependencies: [],
    },

    GERENTE_PERMISOS: {
      name: "GERENTE_PERMISOS",
      ddl: `
        CREATE TABLE IF NOT EXISTS GERENTE_PERMISOS (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_GERENTE NVARCHAR,
          NOMBRE NVARCHAR,
          KEYWORD NVARCHAR,
          UNIQUE(ID_GERENTE, KEYWORD)
        )
      `,
      dependencies: ["GERENTES"],
    },

    METODO_PAGO: {
      name: "METODO_PAGO",
      ddl: `
        CREATE TABLE IF NOT EXISTS METODO_PAGO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          ACTIVO INTEGER,
          ICONO NVARCHAR
        )
      `,
      dependencies: [],
    },

    TIPO_MOVIMIENTO_INVENTARIO: {
      name: "TIPO_MOVIMIENTO_INVENTARIO",
      ddl: `
        CREATE TABLE IF NOT EXISTS TIPO_MOVIMIENTO_INVENTARIO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          CODE NVARCHAR UNIQUE,
          FACTOR INTEGER
        )
      `,
      dependencies: [],
    },

    // Tablas de mesas
    MESA: {
      name: "MESA",
      ddl: `
        CREATE TABLE IF NOT EXISTS MESA (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_SUCURSAL INTEGER,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          ESTATUS INTEGER,
          ACTIVO INTEGER,
          ID_COMANDA INTEGER,
          NOTA NVARCHAR
        )
      `,
      dependencies: ["SUCURSAL"],
    },

    // Tablas de menú
    MENU: {
      name: "MENU",
      ddl: `
        CREATE TABLE IF NOT EXISTS MENU (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE
        )
      `,
      dependencies: [],
    },

    GRUPO_ARTICULOS: {
      name: "GRUPO_ARTICULOS",
      ddl: `
        CREATE TABLE IF NOT EXISTS GRUPO_ARTICULOS (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_MENU NVARCHAR,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          POSICION INTEGER
        )
      `,
      dependencies: ["MENU"],
    },

    ARTICULO: {
      name: "ARTICULO",
      ddl: `
        CREATE TABLE IF NOT EXISTS ARTICULO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_GRUPO NVARCHAR,
          NOMBRE NVARCHAR,
          NOMBRE_CORTO NVARCHAR,
          DESCRIPCION NVARCHAR,
          PRECIO REAL,
          MENU_DIGITAL INTEGER,
          PUNTO_IMPRESION NVARCHAR,
          URL_IMAGEN NVARCHAR,
          TIPO_INVENTARIO NVARCHAR,
          POSICION INTEGER,
          ORIGEN NVARCHAR
        )
      `,
      dependencies: ["GRUPO_ARTICULOS"],
    },

    GRUPO_COMPLEMENTOS: {
      name: "GRUPO_COMPLEMENTOS",
      ddl: `
        CREATE TABLE IF NOT EXISTS GRUPO_COMPLEMENTOS (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_ARTICULO NVARCHAR,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          MULTIPLE INTEGER,
          MIN_SELECCION INTEGER,
          MAX_SELECCION INTEGER,
          REQUERIDO INTEGER,
          POSICION INTEGER
        )
      `,
      dependencies: ["ARTICULO"],
    },

    COMPLEMENTO: {
      name: "COMPLEMENTO",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMPLEMENTO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_GRUPO_COMP NVARCHAR,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          PRECIO REAL,
          URL_IMAGEN NVARCHAR,
          MENU_DIGITAL INTEGER,
          REQUERIDO INTEGER,
          TIPO_INVENTARIO NVARCHAR,
          POSICION INTEGER,
          ORIGEN NVARCHAR
        )
      `,
      dependencies: ["GRUPO_COMPLEMENTOS"],
    },

    // Tablas de gastos
    CATEGORIA_GASTO: {
      name: "CATEGORIA_GASTO",
      ddl: `
        CREATE TABLE IF NOT EXISTS CATEGORIA_GASTO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          SINCRONIZADO INTEGER DEFAULT 1
        )
      `,
      dependencies: [],
    },

    CONCEPTO_GASTO: {
      name: "CONCEPTO_GASTO",
      ddl: `
        CREATE TABLE IF NOT EXISTS CONCEPTO_GASTO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_CATEGORIA NVARCHAR,
          NOMBRE NVARCHAR,
          DESCRIPCION NVARCHAR,
          PRECIO REAL DEFAULT 0,
          SINCRONIZADO INTEGER DEFAULT 1
        )
      `,
      dependencies: ["CATEGORIA_GASTO"],
    },

    REGISTRO_GASTO: {
      name: "REGISTRO_GASTO",
      ddl: `
        CREATE TABLE IF NOT EXISTS REGISTRO_GASTO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_CONCEPTO NVARCHAR,
          MONTO REAL DEFAULT 0,
          FECHA NVARCHAR,
          NOTA NVARCHAR,
          SINCRONIZADO INTEGER DEFAULT 0
        )
      `,
      dependencies: ["CONCEPTO_GASTO"],
    },

    // Tablas de configuración
    TAMAÑO_FUENTES: {
      name: "TAMAÑO_FUENTES",
      ddl: `
        CREATE TABLE IF NOT EXISTS TAMAÑO_FUENTES (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          NOMBRE NVARCHAR UNIQUE,
          VALOR INTEGER,
          ICONO NVARCHAR,
          ACTIVO INTEGER
        )
      `,
      dependencies: [],
    },

    FORMATO_PAGO: {
      name: "FORMATO_PAGO",
      ddl: `
        CREATE TABLE IF NOT EXISTS FORMATO_PAGO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          NOMBRE NVARCHAR UNIQUE,
          VALOR INTEGER,
          ICONO NVARCHAR,
          ACTIVO INTEGER
        )
      `,
      dependencies: [],
    },

    CONFIGURACIONES: {
      name: "CONFIGURACIONES",
      ddl: `
        CREATE TABLE IF NOT EXISTS CONFIGURACIONES (
          ID_SUCURSAL NVARCHAR UNIQUE,
          NOMBRE_DISPOCITIVO NVARCHAR,
          ABIERTO_PEDIDOS INTEGER,
          IMPRIMIR_FICHA INTEGER,
          SOLO_PRODUCTOS_NUEVOS INTEGER,
          ID_TAMAÑO_FUENTE INTEGER,
          COSTO_ENVIO REAL,
          IMPUESTOS REAL,
          DESCUENTOS REAL,
          ID_FORMATO_PAGO INTEGER,
          PROTEGER_VENTAS INTEGER,
          NIP_FINALIZAR_TICKET INTEGER,
          MODO_RESTRICTIVO INTEGER,
          HABILITAR_EDICION_TICKET INTEGER,
          NIP INTEGER
        )
      `,
      dependencies: ["TAMAÑO_FUENTES", "FORMATO_PAGO", "SUCURSAL"],
    },

    HISTORIAL_CAJA: {
      name: "HISTORIAL_CAJA",
      ddl: `
        CREATE TABLE IF NOT EXISTS HISTORIAL_CAJA (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_SUCURSAL NVARCHAR,
          NOMBRE_DISPOCITIVO NVARCHAR,
          FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
          ESTATUS INTEGER,
          MONTO REAL
        )
      `,
      dependencies: ["SUCURSAL"],
    },

    // Tablas de clientes
    CLIENTES: {
      name: "CLIENTES",
      ddl: `
        CREATE TABLE IF NOT EXISTS CLIENTES (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          TELEFONO NVARCHAR,
          CORREO NVARCHAR,
          DIRECCION NVARCHAR,
          NOTAS NVARCHAR,
          DESCRIPCION NVARCHAR,
          DINNER_KEY INTEGER,
          SUCURSAL NVARCHAR,
          SINCRONIZADO INTEGER,
          ACTIVO INTEGER DEFAULT 1,
          CIUDAD NVARCHAR,
          ESTADO NVARCHAR,
          WHATSAPP NVARCHAR
        )
      `,
      dependencies: ["SUCURSAL"],
    },

    // Tablas de inventario
    MATERIA_PRIMA: {
      name: "MATERIA_PRIMA",
      ddl: `
        CREATE TABLE IF NOT EXISTS MATERIA_PRIMA (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR
        )
      `,
      dependencies: [],
    },

    UNIDAD_MEDIDA: {
      name: "UNIDAD_MEDIDA",
      ddl: `
        CREATE TABLE IF NOT EXISTS UNIDAD_MEDIDA (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          NOMBRE NVARCHAR,
          ABREVIACION NVARCHAR
        )
      `,
      dependencies: [],
    },

    MATERIA_PRIMA_SUCURSAL: {
      name: "MATERIA_PRIMA_SUCURSAL",
      ddl: `
        CREATE TABLE IF NOT EXISTS MATERIA_PRIMA_SUCURSAL (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          UUID NVARCHAR UNIQUE,
          ID_MATERIA_PRIMA NVARCHAR,
          ID_UNIDAD_MEDIDA NVARCHAR,
          STOCK_ACTUAL REAL,
          STOCK_MINIMO REAL,
          STOCK_MAXIMO REAL,
          SINCRONIZADO INTEGER DEFAULT 1,
          STOCK_ANTERIOR REAL
        )
      `,
      dependencies: ["MATERIA_PRIMA", "UNIDAD_MEDIDA", "SUCURSAL"],
    },

    // Tablas de comandas/pedidos
    COMANDA: {
      name: "COMANDA",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_SUCURSAL NVARCHAR,
          ID_MESA NVARCHAR,
          ID_CLIENTE NVARCHAR,
          FICHA INTEGER,
          FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
          ESTATUS INTEGER,
          CANCELADO_POR NVARCHAR,
          NOTA NVARCHAR,
          SINCRONIZADO INTEGER,
          CONT_IMPRESO INTEGER,
          DEVICE_KEY NVARCHAR,
          PROPINA REAL,
          COSTO_ENVIO REAL,
          FORMATO_PAGO NVARCHAR,
          DESCUENTO REAL,
          SUBTOTAL REAL,
          IMPUESTOS REAL DEFAULT 0,
          TOTAL REAL,
          ACTIVO INTEGER DEFAULT 1
        )
      `,
      dependencies: ["SUCURSAL", "MESA", "CLIENTES"],
    },

    COMANDA_ARTICULO: {
      name: "COMANDA_ARTICULO",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA_ARTICULO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_COMANDA INTEGER,
          ID_ARTICULO NVARCHAR,
          CANTIDAD_CANCELADOS INTEGER,
          CANTIDAD INTEGER,
          PRECIO_VENTA REAL,
          NOTA NVARCHAR,
          SUBTOTAL REAL,
          TOTAL REAL,
          IMPRESO INTEGER DEFAULT 0,
          FECHA DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      dependencies: ["COMANDA", "ARTICULO"],
    },

    COMANDA_COMPLEMENTO: {
      name: "COMANDA_COMPLEMENTO",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA_COMPLEMENTO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_COMANDA_ARTICULO INTEGER,
          ID_COMPLEMENTO NVARCHAR,
          CANTIDAD_CANCELADOS INTEGER,
          CANTIDAD INTEGER,
          PRECIO_VENTA REAL,
          NOTA NVARCHAR,
          SUBTOTAL REAL,
          TOTAL REAL,
          FECHA DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      dependencies: ["COMANDA_ARTICULO", "COMPLEMENTO"],
    },

    COMANDA_PAGOS: {
      name: "COMANDA_PAGOS",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA_PAGOS (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_COMANDA INTEGER,
          ID_METODO_PAGO INTEGER,
          CANTIDAD REAL
        )
      `,
      dependencies: ["COMANDA", "METODO_PAGO"],
    },

    COMANDA_MOVIMIENTO_TIPO: {
      name: "COMANDA_MOVIMIENTO_TIPO",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA_MOVIMIENTO_TIPO (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          TIPO NVARCHAR UNIQUE,
          ACTIVO INTEGER DEFAULT 1
        )
      `,
      dependencies: [],
    },

    COMANDA_MOVIMIENTOS: {
      name: "COMANDA_MOVIMIENTOS",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA_MOVIMIENTOS (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_COMANDA INTEGER,
          ID_ARTICULO NVARCHAR,
          ID_TIPO INTEGER,
          FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ID_TIPO) REFERENCES COMANDA_MOVIMIENTO_TIPO(ID)
        )
      `,
      dependencies: ["COMANDA", "COMANDA_MOVIMIENTO_TIPO"],
    },

    COMANDA_PAGO_CUENTA_DIVIDIDA: {
      name: "COMANDA_PAGO_CUENTA_DIVIDIDA",
      ddl: `
        CREATE TABLE IF NOT EXISTS COMANDA_PAGO_CUENTA_DIVIDIDA (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          ID_COMANDA INTEGER NOT NULL,
          FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
          CANTIDAD INTEGER NOT NULL,
          TOTAL REAL NOT NULL,
          FORMA_PAGO INTEGER NOT NULL
        )
      `,
      dependencies: ["COMANDA"],
    },

    // Tabla de control de esquema
    _SCHEMA_VERSION: {
      name: "_SCHEMA_VERSION",
      ddl: `
        CREATE TABLE IF NOT EXISTS _SCHEMA_VERSION (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          VERSION INTEGER NOT NULL,
          TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP,
          DESCRIPTION NVARCHAR
        )
      `,
      dependencies: [],
    },
  },

  /**
   * Obtiene todas las tablas en orden de dependencias
   */
  getTableCreationOrder() {
    const tables = Object.values(this.tables);
    const ordered = [];
    const processed = new Set();

    const addTable = (table) => {
      if (processed.has(table.name)) return;

      for (const dep of table.dependencies) {
        const depTable = Object.values(this.tables).find((t) => t.name === dep);
        if (depTable) addTable(depTable);
      }

      ordered.push(table);
      processed.add(table.name);
    };

    tables.forEach((table) => addTable(table));
    return ordered;
  },
};
