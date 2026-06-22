import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from '../../../utils/db';

export class Database {
    static async generalModel(data) {
        const db = await getDb();
        await db.execAsync(`
           DROP TABLE IF EXISTS DEVICE;
           DROP TABLE IF EXISTS SUCURSAL;
           DROP TABLE IF EXISTS NEGOCIO;
           DROP TABLE IF EXISTS PLAN;

           CREATE TABLE IF NOT EXISTS DEVICE (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UUID NVARCHAR UNIQUE,
            NOMBRE NVARCHAR,
            DEVICE_KEY NVARCHAR,
            RECIBE_PEDIDOS INTEGER,
            ESTATUS NVARCHAR,
            ACTIVO INTEGER
        );
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
        );
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
        );
        CREATE TABLE IF NOT EXISTS PLAN (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UUID NVARCHAR UNIQUE,
            NOMBRE NVARCHAR,
            COSTO NVARCHAR,
            CANTIDAD_DISPOSITIVOS INTEGER
        );
        CREATE TABLE IF NOT EXISTS PUNTOS_IMPRESION (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UUID NVARCHAR UNIQUE,
            ID_SUCURSAL NVARCHAR,
            NOMBRE NVARCHAR,
            ID_IMPRESORA NVARCHAR
            
        );

        CREATE TABLE IF NOT EXISTS BLUETOOTH_ENCONTRADOS (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            ADDRESS NVARCHAR UNIQUE,
            NAME NVARCHAR,
            TIPO NVARCHAR
        );
        `);
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS GERENTES(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
               NAME NVARCHAR,
               NIP INTEGER
        );
        `)


        const { device, branch, business, plan, printPoints } = data;



        await db.runAsync(
            `INSERT OR IGNORE INTO PUNTOS_IMPRESION (UUID, NOMBRE, ID_SUCURSAL) VALUES (?, ?, ?)`,
            [
                'PRIMER_PUNTO', 'Caja', branch.id
            ]
        );
        printPoints?.forEach(async (pp) => {
            await db.runAsync(
                `INSERT OR IGNORE INTO PUNTOS_IMPRESION (UUID, NOMBRE, ID_SUCURSAL) VALUES (?, ?, ?)`,
                [
                    pp.id, pp.name, branch.id
                ]
            );
        });
        await db.runAsync(
            `INSERT OR IGNORE INTO DEVICE (UUID, NOMBRE, DEVICE_KEY, RECIBE_PEDIDOS, ESTATUS, ACTIVO) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                device.id,
                device.name,
                device.deviceKey,
                device.flagReceivesOrders ? 1 : 0,
                device.status,
                1
            ]
        );

        await db.runAsync(
            `INSERT OR IGNORE INTO SUCURSAL (UUID, NOMBRE, DESCRIPCION, CODIGO_QR, DIRECCION, LAT, LNG, TELEFONO, WHATSAPP, FACEBOK, INSTAGRAM, TIKTOK, TWITTER, WEBSITE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                branch.id,
                branch.name,
                branch.description,
                branch.qrCode,
                branch.address,
                branch.location.latitude,
                branch.location.longitude,
                branch.contact.phoneNumber,
                branch.contact.whatsapp,
                branch.socialMedia.facebook,
                branch.socialMedia.instagram,
                branch.socialMedia.tiktok,
                branch.socialMedia.twitter,
                branch.socialMedia.website
            ]
        );

        await db.runAsync(
            `INSERT OR IGNORE INTO NEGOCIO (UUID, NOMBRE_NEGOCIO, RAZON_SOCIAL, RFC, TELEFONO, CODIGO_POSTAL, DIRECCION, LOGO, NOTIFICAR_INVENTARIO, ESTATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                business.id,
                business.businessName,
                business.companyName,
                business.rfc,
                business.phoneNumber,
                business.zipCode,
                business.address,
                business.logo,
                business.notifyInventory ? 1 : 0,
                business.status
            ]
        );

        await db.runAsync(
            `INSERT OR IGNORE INTO PLAN (UUID, NOMBRE, COSTO, CANTIDAD_DISPOSITIVOS) VALUES (?, ?, ?, ?)`,
            [
                plan.id,
                plan.name,
                plan.cost,
                plan.deviceCount
            ]
        );

        await db.execAsync(`
            DROP TABLE IF EXISTS METODO_PAGO;
            CREATE TABLE IF NOT EXISTS METODO_PAGO (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID NVARCHAR UNIQUE,
                NOMBRE NVARCHAR,
                ACTIVO INTEGER,
                ICONO NVARCHAR
        );
        `);

        // Soporta payload general ({ paymentMethods: [...] }) y formatos legacy.
        const metodos =
            Array.isArray(data?.paymentMethods) ? data.paymentMethods
                : Array.isArray(data?.data?.paymentMethods) ? data.data.paymentMethods
                    : Array.isArray(data) ? data
                        : (data?.data ?? []);
        for (const metodo of metodos) {
            if (!metodo?.id || !metodo?.name) continue;
            await db.runAsync(
                `INSERT OR IGNORE INTO METODO_PAGO (UUID, NOMBRE, ACTIVO, ICONO) VALUES (?, ?, ?, ?)`,
                [
                    metodo.id,
                    metodo.name,
                    (metodo.active ?? metodo.activo ?? true) ? 1 : 0,
                    metodo.icon ?? metodo.icono ?? null
                ]
            );
        }
        // instruccion que me trae los metodos de pago de la base de datos
        const metodosDb = await db.getAllAsync(`SELECT * FROM METODO_PAGO`);

        // Tabla de tipos de movimiento de inventario (IN-APP / OUT-APP, etc.)
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS TIPO_MOVIMIENTO_INVENTARIO (
                ID     INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID   NVARCHAR UNIQUE,
                NOMBRE NVARCHAR,
                CODE   NVARCHAR UNIQUE,
                FACTOR INTEGER
            )
        `);
        for (const tipo of (data?.inventoryMovementTypes ?? [])) {
            if (!tipo?.id || !tipo?.code) continue;
            await db.runAsync(
                `INSERT OR REPLACE INTO TIPO_MOVIMIENTO_INVENTARIO (UUID, NOMBRE, CODE, FACTOR) VALUES (?, ?, ?, ?)`,
                [tipo.id, tipo.name, tipo.code, tipo.factor ?? 1]
            );
        }

    }
    static async mesasModel(data) {
        const qrData = await AsyncStorage.getItem('qrCode');
        const db = await getDb();
        await db.execAsync(`
            DROP TABLE IF EXISTS MESA;
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
            );
         `
        );
        let qeury = `INSERT OR IGNORE INTO MESA (UUID, ID_SUCURSAL, NOMBRE, DESCRIPCION, ESTATUS, ACTIVO) VALUES`
        data.data.map((mesa, index) => {
            if (index === data.data.length - 1) {
                qeury += `('${mesa.id}', '${qrData}', '${mesa.name}', '${mesa.description}',0, ${mesa.active == 'activo' ? 1 : 0})\n`
                return;
            }
            else {
                qeury += `('${mesa.id}', '${qrData}', '${mesa.name}', '${mesa.description}',0, ${mesa.active == 'activo' ? 1 : 0}),\n`
            }
        })


        await db.runAsync(qeury);

    }
    static async menuModel(data) {
        const db = await getDb();


        await db.execAsync(`
            DROP TABLE IF EXISTS COMPLEMENTO;
            DROP TABLE IF EXISTS GRUPO_COMPLEMENTOS;
            DROP TABLE IF EXISTS ARTICULO;
            DROP TABLE IF EXISTS GRUPO_ARTICULOS;
            DROP TABLE IF EXISTS MENU;

            CREATE TABLE IF NOT EXISTS MENU (
                ID   INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID NVARCHAR UNIQUE
            );

            CREATE TABLE IF NOT EXISTS GRUPO_ARTICULOS (
                ID          INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID        NVARCHAR UNIQUE,
                ID_MENU     NVARCHAR,
                NOMBRE      NVARCHAR,
                DESCRIPCION NVARCHAR,
                POSICION    INTEGER
            );
            CREATE TABLE IF NOT EXISTS ARTICULO (
                ID               INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID             NVARCHAR UNIQUE,
                ID_GRUPO         NVARCHAR,
                NOMBRE           NVARCHAR,
                NOMBRE_CORTO     NVARCHAR,
                DESCRIPCION      NVARCHAR,
                PRECIO           REAL,
                MENU_DIGITAL     INTEGER,
                PUNTO_IMPRESION  NVARCHAR,
                URL_IMAGEN       NVARCHAR,
                TIPO_INVENTARIO  NVARCHAR,
                POSICION         INTEGER,
                ORIGEN           NVARCHAR
            );

            CREATE TABLE IF NOT EXISTS GRUPO_COMPLEMENTOS (
                ID            INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID          NVARCHAR UNIQUE,
                ID_ARTICULO   NVARCHAR,
                NOMBRE        NVARCHAR,
                DESCRIPCION   NVARCHAR,
                MULTIPLE      INTEGER,
                MIN_SELECCION INTEGER,
                MAX_SELECCION INTEGER,
                REQUERIDO     INTEGER,
                POSICION      INTEGER
            );

            CREATE TABLE IF NOT EXISTS COMPLEMENTO (
                ID              INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID            NVARCHAR UNIQUE,
                ID_GRUPO_COMP   NVARCHAR,
                NOMBRE          NVARCHAR,
                DESCRIPCION     NVARCHAR,
                PRECIO          REAL,
                URL_IMAGEN      NVARCHAR,
                MENU_DIGITAL    INTEGER,
                REQUERIDO       INTEGER,
                TIPO_INVENTARIO NVARCHAR,
                POSICION        INTEGER,
                ORIGEN          NVARCHAR
            );
        `);

        const { menuId, menuGroups } = data.data;

        await db.runAsync(
            `INSERT OR IGNORE INTO MENU (UUID) VALUES (?)`,
            [menuId]
        );

        for (const grupo of menuGroups) {
            await db.runAsync(
                `INSERT OR IGNORE INTO GRUPO_ARTICULOS (UUID, ID_MENU, NOMBRE, DESCRIPCION, POSICION) VALUES (?, ?, ?, ?, ?)`,
                [grupo.id, menuId, grupo.name, grupo.description ?? null, grupo.position]
            );

            for (const articulo of (grupo.articles || [])) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO ARTICULO
                        (UUID, ID_GRUPO, NOMBRE, NOMBRE_CORTO, DESCRIPCION, PRECIO,
                         MENU_DIGITAL, PUNTO_IMPRESION, URL_IMAGEN, TIPO_INVENTARIO,
                         POSICION, ORIGEN)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        articulo.id,
                        grupo.id,
                        articulo.name,
                        articulo.shortName ?? null,
                        articulo.description ?? null,
                        articulo.price,
                        articulo.flagMenuDigital ? 1 : 0,
                        articulo.printPointId ?? null,
                        articulo.imageUrl ?? null,
                        articulo.inventoryType ?? null,
                        articulo.position,
                        articulo.source ?? null
                    ]
                );

                for (const grupoComp of (articulo.complementGroups || [])) {
                    await db.runAsync(
                        `INSERT OR IGNORE INTO GRUPO_COMPLEMENTOS
                            (UUID, ID_ARTICULO, NOMBRE, DESCRIPCION, MULTIPLE,
                             MIN_SELECCION, MAX_SELECCION, REQUERIDO, POSICION)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            grupoComp.id,
                            articulo.id,
                            grupoComp.name,
                            grupoComp.description ?? null,
                            grupoComp.multiple ? 1 : 0,
                            grupoComp.minSelection,
                            grupoComp.maxSelection,
                            grupoComp.required ? 1 : 0,
                            grupoComp.position
                        ]
                    );

                    for (const complemento of (grupoComp.complements || [])) {
                        await db.runAsync(
                            `INSERT OR REPLACE INTO COMPLEMENTO
                                (UUID, ID_GRUPO_COMP, NOMBRE, DESCRIPCION, PRECIO,
                                 URL_IMAGEN, MENU_DIGITAL, REQUERIDO, TIPO_INVENTARIO,
                                 POSICION, ORIGEN)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                complemento.id,
                                grupoComp.id,
                                complemento.name,
                                complemento.description ?? null,
                                complemento.price,
                                complemento.imageUrl ?? null,
                                complemento.flagMenuDigital ? 1 : 0,
                                complemento.required ? 1 : 0,
                                complemento.inventoryType ?? null,
                                complemento.position,
                                complemento.source ?? null
                            ]
                        );
                    }
                }
            }
        }
        // await db.getAllAsync(`SELECT * FROM MENU`).then(result => console.log("MENU", JSON.stringify(result,null,2)));
        // await db.getAllAsync(`SELECT * FROM GRUPO_ARTICULOS`).then(result => console.log("GRUPO_ARTICULOS", JSON.stringify(result,null,2)));
        // await db.getAllAsync(`SELECT * FROM ARTICULO`).then(result => console.log("ARTICULO", JSON.stringify(result,null,2)));
        // await db.getAllAsync(`SELECT * FROM GRUPO_COMPLEMENTOS`).then(result => console.log("GRUPO_COMPLEMENTOS", JSON.stringify(result,null,2)));
        // await db.getAllAsync(`SELECT * FROM COMPLEMENTO`).then(result => console.log("COMPLEMENTO", JSON.stringify(result,null,2)));
    }

    static async gastosModel(data) {
        const db = await getDb();

        // DDL separado para evitar fallos silenciosos de execAsync con múltiples sentencias
        await db.runAsync(`DROP TABLE IF EXISTS CONCEPTO_GASTO`);
        await db.runAsync(`DROP TABLE IF EXISTS CATEGORIA_GASTO`);

        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS CATEGORIA_GASTO (
                ID           INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID         NVARCHAR UNIQUE,
                NOMBRE       NVARCHAR,
                DESCRIPCION  NVARCHAR,
                SINCRONIZADO INTEGER DEFAULT 1
            )
        `);
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS CONCEPTO_GASTO (
                ID               INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID             NVARCHAR UNIQUE,
                ID_CATEGORIA     NVARCHAR,
                NOMBRE           NVARCHAR,
                DESCRIPCION      NVARCHAR,
                PRECIO           REAL DEFAULT 0,
                SINCRONIZADO     INTEGER DEFAULT 1
            )
        `);
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS REGISTRO_GASTO (
                ID           INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_CONCEPTO  NVARCHAR,
                MONTO        REAL DEFAULT 0,
                FECHA        NVARCHAR,
                NOTA         NVARCHAR,
                SINCRONIZADO INTEGER DEFAULT 0
            )
        `);
        // Migración: añade SINCRONIZADO si la tabla ya existía sin esa columna
        try {
            await db.runAsync(`ALTER TABLE REGISTRO_GASTO ADD COLUMN SINCRONIZADO INTEGER DEFAULT 0`);
        } catch (_) { /* columna ya existe, ignorar */ }


        // Tolera tanto data = [...] directo como data = { data: [...] }
        const categorias = Array.isArray(data) ? data : (data?.data ?? []);

        for (const categoria of categorias) {
            await db.runAsync(
                `INSERT OR IGNORE INTO CATEGORIA_GASTO (UUID, NOMBRE, DESCRIPCION, SINCRONIZADO) VALUES (?, ?, ?, 1)`,
                [categoria.id, categoria.name, categoria.description ?? null]
            );

            for (const concepto of (categoria.concepts || [])) {
                await db.runAsync(
                    `INSERT OR IGNORE INTO CONCEPTO_GASTO (UUID, ID_CATEGORIA, NOMBRE, DESCRIPCION, PRECIO, SINCRONIZADO) VALUES (?, ?, ?, ?, ?, 1)`,
                    [concepto.id, categoria.id, concepto.name, concepto.description ?? null, concepto.price ?? concepto.precio ?? 0]
                );
            }
        }
    }
    static async configuracionesModel() {
        const qrData = await AsyncStorage.getItem('qrCode');
        const db = await getDb();
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS TAMAÑO_FUENTES 
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NOMBRE NVARCHAR UNIQUE,
                VALOR INTEGER,
                ICONO NVARCHAR,
                ACTIVO INTEGER
            );
            CREATE TABLE IF NOT EXISTS FORMATO_PAGO 
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NOMBRE NVARCHAR UNIQUE,
                VALOR INTEGER,
                ICONO NVARCHAR,
                ACTIVO INTEGER
            );
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
                NIP INTEGER);
        `
        )
        await db.execAsync(`
            INSERT OR IGNORE INTO TAMAÑO_FUENTES (NOMBRE, VALOR, ICONO, ACTIVO) VALUES 
            ('Pequeña', 8, 'text-size', 1),    
            ('Mediana', 12, 'text-size', 1),    
            ('Grande', 16, 'text-size', 1);

            INSERT OR IGNORE INTO FORMATO_PAGO (NOMBRE, VALOR, ACTIVO) VALUES 
            ('Efectivo', 1, 1),    
            ('Tarjeta', 1, 1),    
            ('Transferencia', 1, 1),
            ('Mercado pago', 1, 1),
            ('Clip', 1, 1),
            ('Izettle', 1, 1),
            ('Pendiente', 1, 1);

            INSERT OR IGNORE INTO CONFIGURACIONES (
            ID_SUCURSAL, 
            NOMBRE_DISPOCITIVO, 
            ABIERTO_PEDIDOS, 
            IMPRIMIR_FICHA, 
            SOLO_PRODUCTOS_NUEVOS, 
            ID_TAMAÑO_FUENTE, 
            COSTO_ENVIO, 
            IMPUESTOS, 
            DESCUENTOS, 
            ID_FORMATO_PAGO, 
            PROTEGER_VENTAS, 
            NIP_FINALIZAR_TICKET,
            MODO_RESTRICTIVO, 
            NIP) 
            VALUES
            (
            '${qrData}', 
            'Dispositivo de prueba', 
            1, 
            1, 
            0, 
            2, 
            0.00, 
            0.00, 
            0.00, 
            1, 
            1, 
            1, 
            0, 
            1234
            );
        `)

    }
    static async historialCajaModel() {
        const db = await getDb();
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS HISTORIAL_CAJA (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_SUCURSAL NVARCHAR, 
                NOMBRE_DISPOCITIVO NVARCHAR,
                FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
                ESTATUS INTEGER,
                MONTO REAL
        );
        `
        )

    }
    static async clientesModel(data) {
        const qrData = await AsyncStorage.getItem('qrCode');
        const db = await getDb();

        await db.execAsync(`
            --DROP TABLE IF EXISTS CLIENTES;
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
                SINCRONIZADO INTEGER
            );
        `);

        const rows = [];
        data?.data?.forEach((cliente) => {
            const nombre = (cliente.fullName || '').replace(/'/g, "''");
            const telefono = (cliente.phoneNumber || '').replace(/'/g, "''");
            const correo = (cliente.email || '').replace(/'/g, "''");
            const direccion = (cliente.address || '').replace(/'/g, "''");
            const notas = cliente.notes ? `'${cliente.notes.replace(/'/g, "''")}'` : 'NULL';
            const descripcion = (cliente.description || '').replace(/'/g, "''");

            rows.push(
                `('${cliente.id}', '${nombre}', '${telefono}', '${correo}', '${direccion}', ${notas}, '${descripcion}', ${cliente.dinerKey}, '${qrData}', 1)`
            );
        });

        if (rows.length > 0) {
            const query = `INSERT OR IGNORE INTO CLIENTES 
                (UUID, NOMBRE, TELEFONO, CORREO, DIRECCION, NOTAS, DESCRIPCION, DINNER_KEY, SUCURSAL, SINCRONIZADO)
                VALUES ${rows.join(',\n')}`;
            await db.execAsync(query);
        }



        return true;
    }
    static async inventoryModel(data) {
        const db = await getDb();

        await db.execAsync(`
            DROP TABLE IF EXISTS UNIDAD_MEDIDA;
            DROP TABLE IF EXISTS MATERIA_PRIMA_SUCURSAL;
            DROP TABLE IF EXISTS MATERIA_PRIMA;

            CREATE TABLE IF NOT EXISTS MATERIA_PRIMA (
                ID      INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID    NVARCHAR UNIQUE,
                NOMBRE  NVARCHAR
            );

            CREATE TABLE IF NOT EXISTS UNIDAD_MEDIDA (
                ID           INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID         NVARCHAR UNIQUE,
                NOMBRE       NVARCHAR,
                ABREVIACION  NVARCHAR
            );

            CREATE TABLE IF NOT EXISTS MATERIA_PRIMA_SUCURSAL (
                ID                  INTEGER PRIMARY KEY AUTOINCREMENT,
                UUID                NVARCHAR UNIQUE,
                ID_MATERIA_PRIMA    NVARCHAR,
                ID_UNIDAD_MEDIDA    NVARCHAR,
                STOCK_ACTUAL        REAL,
                STOCK_MINIMO        REAL,
                STOCK_MAXIMO        REAL,
                SINCRONIZADO        INTEGER DEFAULT 1
            );
        `);

        for (const item of (data?.data ?? [])) {
            await db.runAsync(
                `INSERT OR IGNORE INTO MATERIA_PRIMA (UUID, NOMBRE) VALUES (?, ?)`,
                [item.id, item.name]
            );

            for (const sucursal of (item.rawMaterialsBranches ?? [])) {
                const unidad = sucursal.measurementUnits;
                if (unidad) {
                    await db.runAsync(
                        `INSERT OR IGNORE INTO UNIDAD_MEDIDA (UUID, NOMBRE, ABREVIACION) VALUES (?, ?, ?)`,
                        [unidad.id, unidad.name, unidad.abbreviation]
                    );
                }

                await db.runAsync(
                    `INSERT OR REPLACE INTO MATERIA_PRIMA_SUCURSAL
                        (UUID, ID_MATERIA_PRIMA, ID_UNIDAD_MEDIDA, STOCK_ACTUAL, STOCK_MINIMO, STOCK_MAXIMO)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        sucursal.id,
                        item.id,
                        unidad?.id ?? null,
                        parseFloat(sucursal.stockCurrent) || 0,
                        parseFloat(sucursal.stockMin) || 0,
                        parseFloat(sucursal.stockMax) || 0,
                    ]
                );
            }
        }

        return true;
    }
    static async comandaTableModel() {
        const db = await getDb();
        // Migración: agrega ID_SUCURSAL si la tabla ya existe sin esa columna
        try {
            await db.execAsync(`ALTER TABLE COMANDA ADD COLUMN ID_SUCURSAL NVARCHAR`);
        } catch (_) { /* columna ya existe o tabla aún no existe, se ignora */ }
        await db.execAsync(`
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
                TOTAL REAL,
                ACTIVO INTEGER DEFAULT 1
        );
        `)
        await db.execAsync(`
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
        );
        `)
        await db.execAsync(`
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
        );
        `)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS COMANDA_PAGOS(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_COMANDA INTEGER,
                ID_METODO_PAGO,
                CANTIDAD
        );
        `)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS COMANDA_MOVIMIENTO_TIPO (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                TIPO NVARCHAR UNIQUE,
                ACTIVO INTEGER DEFAULT 1
            );
        `)
        await db.execAsync(`
            INSERT OR IGNORE INTO COMANDA_MOVIMIENTO_TIPO (TIPO, ACTIVO) VALUES
            ('IMPRESION_TICKET', 1),
            ('ELIMINACION_ARTICULO', 1),
            ('INCREMENTAR_ARTICULO', 1),
            ('DISMINUIR_ARTICULO', 1);
        `)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS COMANDA_MOVIMIENTOS (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_COMANDA INTEGER,
                ID_ARTICULO NVARCHAR,
                ID_TIPO INTEGER,
                FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ID_TIPO) REFERENCES COMANDA_MOVIMIENTO_TIPO(ID)
            );
        `)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS COMANDA_PAGO_CUENTA_DIVIDIDA (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_COMANDA INTEGER NOT NULL,
                FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
                CANTIDAD INTEGER NOT NULL,
                TOTAL REAL NOT NULL,
                FORMA_PAGO INTEGER NOT NULL
            );
        `)
    }
    // static async paymentMethodModel(data) {
    //     const db = await getDb();
    //     await db.execAsync(`
    //         DROP TABLE IF EXISTS METODO_PAGO;
    //         CREATE TABLE IF NOT EXISTS METODO_PAGO (
    //             ID INTEGER PRIMARY KEY AUTOINCREMENT,
    //             UUID NVARCHAR UNIQUE,
    //             NOMBRE NVARCHAR,
    //             ACTIVO INTEGER
    //     );
    //     `);
    //     const metodos = Array.isArray(data) ? data : (data?.data ?? []);


    // }
}