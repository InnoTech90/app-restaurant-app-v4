import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDb } from "../../../utils/db";

/**
 * Database
 * IMPORTANTE: No crea tablas aquí. Las tablas son creadas por DatabaseInitializer.
 * Este archivo solo se encarga de INSERTAR/ACTUALIZAR datos desde la API.
 */
export class Database {
  /**
   * Inserta datos generales (dispositivo, sucursal, negocio, plan, etc.)
   * Sin crear tablas - asume que ya existen
   */
  static async generalModel(data) {
    const db = await getDb();

    const { device, branch, business, plan, printPoints } = data;

    // Insertar punto de impresión por defecto si no existe
    await db.runAsync(
      `INSERT OR IGNORE INTO PUNTOS_IMPRESION (UUID, NOMBRE, ID_SUCURSAL) VALUES (?, ?, ?)`,
      ["PRIMER_PUNTO", "Caja", branch.id],
    );

    // Insertar puntos de impresión adicionales
    if (Array.isArray(printPoints) && printPoints.length > 0) {
      for (const pp of printPoints) {
        await db.runAsync(
          `INSERT OR IGNORE INTO PUNTOS_IMPRESION (UUID, NOMBRE, ID_SUCURSAL) VALUES (?, ?, ?)`,
          [pp.id, pp.name, branch.id],
        );
      }
    }

    // Insertar dispositivo
    await db.runAsync(
      `INSERT OR IGNORE INTO DEVICE (UUID, NOMBRE, DEVICE_KEY, RECIBE_PEDIDOS, ESTATUS, ACTIVO) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        device.id,
        device.name,
        device.deviceKey,
        device.flagReceivesOrders ? 1 : 0,
        device.status,
        1,
      ],
    );

    // Insertar sucursal
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
        branch.socialMedia.website,
      ],
    );

    // Insertar negocio
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
        business.status,
      ],
    );

    // Insertar plan
    await db.runAsync(
      `INSERT OR IGNORE INTO PLAN (UUID, NOMBRE, COSTO, CANTIDAD_DISPOSITIVOS) VALUES (?, ?, ?, ?)`,
      [plan.id, plan.name, plan.cost, plan.deviceCount],
    );

    // Insertar métodos de pago
    // Soporta payload general ({ paymentMethods: [...] }) y formatos legacy
    const metodos = Array.isArray(data?.paymentMethods)
      ? data.paymentMethods
      : Array.isArray(data?.data?.paymentMethods)
        ? data.data.paymentMethods
        : Array.isArray(data)
          ? data
          : (data?.data ?? []);

    for (const metodo of metodos) {
      if (!metodo?.id || !metodo?.name) continue;
      await db.runAsync(
        `INSERT OR IGNORE INTO METODO_PAGO (UUID, NOMBRE, ACTIVO, ICONO) VALUES (?, ?, ?, ?)`,
        [
          metodo.id,
          metodo.name,
          (metodo.active ?? metodo.activo ?? true) ? 1 : 0,
          metodo.icon ?? metodo.icono ?? null,
        ],
      );
    }

    // Insertar tipos de movimiento de inventario
    if (
      Array.isArray(data?.inventoryMovementTypes) &&
      data.inventoryMovementTypes.length > 0
    ) {
      for (const tipo of data.inventoryMovementTypes) {
        if (!tipo?.id || !tipo?.code) continue;
        await db.runAsync(
          `INSERT OR REPLACE INTO TIPO_MOVIMIENTO_INVENTARIO (UUID, NOMBRE, CODE, FACTOR) VALUES (?, ?, ?, ?)`,
          [tipo.id, tipo.name, tipo.code, tipo.factor ?? 1],
        );
      }
    }

    console.log("✅ Datos generales insertados correctamente");
  }

  /**
   * Inserta datos de mesas
   * Sin crear tablas - asume que MESA ya existe
   */
  static async mesasModel(data) {
    const qrData = await AsyncStorage.getItem("qrCode");
    const db = await getDb();

    if (!Array.isArray(data?.data) || data.data.length === 0) {
      console.log("⚠️  No hay mesas para insertar");
      return;
    }

    // Marcar mesas existentes como inactivas
    await db.runAsync(`UPDATE MESA SET ACTIVO = 0 WHERE ID_SUCURSAL = ?`, [
      qrData,
    ]);

    // Insertar o actualizar mesas existentes por UUID para reflejar cambios como nombre,
    // descripción u otras propiedades sin duplicar registros.
    for (const mesa of data.data) {
      await db.runAsync(
        `INSERT INTO MESA (UUID, ID_SUCURSAL, NOMBRE, DESCRIPCION, ESTATUS, ACTIVO)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(UUID) DO UPDATE SET
           ID_SUCURSAL = excluded.ID_SUCURSAL,
           NOMBRE = excluded.NOMBRE,
           DESCRIPCION = excluded.DESCRIPCION,
           ESTATUS = excluded.ESTATUS,
           ACTIVO = excluded.ACTIVO`,
        [
          mesa.id,
          qrData,
          mesa.name,
          mesa.description,
          0,
          mesa.active === "activo" ? 1 : 0,
        ],
      );
    }

    console.log(`✅ ${data.data.length} mesas sincronizadas correctamente`);
  }

  /**
   * Inserta datos del menú
   * Sin crear tablas - asume que MENU, GRUPO_ARTICULOS, ARTICULO, etc. ya existen
   */
  static async menuModel(data) {
    const db = await getDb();

    const { menuId, menuGroups } = data.data;

    // Insertar menú
    await db.runAsync(`INSERT OR IGNORE INTO MENU (UUID) VALUES (?)`, [menuId]);

    let articlesCount = 0;
    let complementsCount = 0;

    // Insertar grupos de artículos
    for (const grupo of menuGroups) {
      await db.runAsync(
        `INSERT OR IGNORE INTO GRUPO_ARTICULOS (UUID, ID_MENU, NOMBRE, DESCRIPCION, POSICION) VALUES (?, ?, ?, ?, ?)`,
        [
          grupo.id,
          menuId,
          grupo.name,
          grupo.description ?? null,
          grupo.position,
        ],
      );

      // Insertar artículos
      for (const articulo of grupo.articles || []) {
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
            articulo.source ?? null,
          ],
        );
        articlesCount++;

        // Insertar grupos de complementos
        for (const grupoComp of articulo.complementGroups || []) {
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
              grupoComp.position,
            ],
          );

          // Insertar complementos
          for (const complemento of grupoComp.complements || []) {
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
                complemento.source ?? null,
              ],
            );
            complementsCount++;
          }
        }
      }
    }

    console.log(
      `✅ Menú insertado: ${articlesCount} artículos, ${complementsCount} complementos`,
    );
  }

  /**
   * Inserta datos de gastos
   * Sin crear tablas - asume que CATEGORIA_GASTO, CONCEPTO_GASTO, REGISTRO_GASTO ya existen
   */
  static async gastosModel(data) {
    const db = await getDb();

    // Tolera tanto data = [...] directo como data = { data: [...] }
    const categorias = Array.isArray(data) ? data : (data?.data ?? []);

    if (categorias.length === 0) {
      console.log("⚠️  No hay categorías de gasto para insertar");
      return;
    }

    let categoriasCount = 0;
    let conceptosCount = 0;

    for (const categoria of categorias) {
      await db.runAsync(
        `INSERT OR IGNORE INTO CATEGORIA_GASTO (UUID, NOMBRE, DESCRIPCION, SINCRONIZADO) VALUES (?, ?, ?, 1)`,
        [categoria.id, categoria.name, categoria.description ?? null],
      );
      categoriasCount++;

      for (const concepto of categoria.concepts || []) {
        await db.runAsync(
          `INSERT OR IGNORE INTO CONCEPTO_GASTO (UUID, ID_CATEGORIA, NOMBRE, DESCRIPCION, PRECIO, SINCRONIZADO) VALUES (?, ?, ?, ?, ?, 1)`,
          [
            concepto.id,
            categoria.id,
            concepto.name,
            concepto.description ?? null,
            concepto.price ?? concepto.precio ?? 0,
          ],
        );
        conceptosCount++;
      }
    }

    console.log(
      `✅ Gastos insertados: ${categoriasCount} categorías, ${conceptosCount} conceptos`,
    );
  }

  /**
   * Inserta configuraciones iniciales
   * Sin crear tablas - asume que TAMAÑO_FUENTES, FORMATO_PAGO, CONFIGURACIONES ya existen
   */
  static async configuracionesModel() {
    const qrData = await AsyncStorage.getItem("qrCode");
    const db = await getDb();

    // Verificar si ya existe configuración para esta sucursal
    const existingConfig = await db.getFirstAsync(
      `SELECT * FROM CONFIGURACIONES WHERE ID_SUCURSAL = ?`,
      [qrData],
    );

    if (existingConfig) {
      console.log("⚠️  Configuración ya existe para esta sucursal");
      return;
    }

    // Insertar configuración inicial
    await db.runAsync(
      `INSERT OR IGNORE INTO CONFIGURACIONES (
        ID_SUCURSAL, NOMBRE_DISPOCITIVO, ABIERTO_PEDIDOS, IMPRIMIR_FICHA,
        SOLO_PRODUCTOS_NUEVOS, ID_TAMAÑO_FUENTE, COSTO_ENVIO, IMPUESTOS,
        DESCUENTOS, ID_FORMATO_PAGO, PROTEGER_VENTAS, NIP_FINALIZAR_TICKET,
        MODO_RESTRICTIVO, NIP
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        qrData,
        "Dispositivo de prueba",
        1,
        1,
        0,
        2,
        0.0,
        0.0,
        0.0,
        1,
        1,
        1,
        0,
        1234,
      ],
    );

    console.log("✅ Configuraciones insertadas correctamente");
  }

  /**
   * Crea la tabla de historial de caja
   * Sin crear tabla - asume que HISTORIAL_CAJA ya existe
   */
  static async historialCajaModel() {
    // La tabla es creada por DatabaseInitializer
    console.log(
      "ℹ️  Tabla HISTORIAL_CAJA ya existe (creada por DatabaseInitializer)",
    );
  }

  /**
   * Crea tablas relacionadas con comandas
   * Sin crear tablas - asume que COMANDA, COMANDA_ARTICULO, etc. ya existen
   */
  static async comandaTableModel() {
    // Las tablas son creadas por DatabaseInitializer
    console.log(
      "ℹ️  Tablas de COMANDA ya existen (creadas por DatabaseInitializer)",
    );
  }

  /**
   * Inserta datos de clientes
   * Sin crear tabla - asume que CLIENTES ya existe
   */
  static async clientesModel(data) {
    const qrData = await AsyncStorage.getItem("qrCode");
    const db = await getDb();

    if (!data?.data?.length) {
      console.log("⚠️  No hay clientes para insertar");
      return;
    }

    let clientesCount = 0;

    for (const cliente of data.data) {
      await db.runAsync(
        `
            INSERT INTO CLIENTES (
                UUID, NOMBRE, TELEFONO, CORREO, DIRECCION, NOTAS,
                DESCRIPCION, DINNER_KEY, SUCURSAL, SINCRONIZADO, ACTIVO
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
            ON CONFLICT(UUID)
            DO UPDATE SET
                NOMBRE = excluded.NOMBRE,
                TELEFONO = excluded.TELEFONO,
                CORREO = excluded.CORREO,
                DIRECCION = excluded.DIRECCION,
                NOTAS = excluded.NOTAS,
                DESCRIPCION = excluded.DESCRIPCION,
                DINNER_KEY = excluded.DINNER_KEY,
                SUCURSAL = excluded.SUCURSAL,
                SINCRONIZADO = 1,
                ACTIVO = 1
            `,
        [
          cliente.id,
          cliente.fullName || "",
          cliente.phoneNumber || "",
          cliente.email || "",
          cliente.address || "",
          cliente.notes || null,
          cliente.description || "",
          cliente.dinerKey || 0,
          qrData,
        ],
      );
      clientesCount++;
    }

    console.log(`✅ ${clientesCount} clientes insertados correctamente`);
    return true;
  }

  /**
   * Inserta datos de inventario
   * Sin crear tablas - asume que MATERIA_PRIMA, UNIDAD_MEDIDA, MATERIA_PRIMA_SUCURSAL ya existen
   */
  static async inventoryModel(data) {
    const db = await getDb();

    if (!data?.data?.length) {
      console.log("⚠️  No hay inventario para insertar");
      return true;
    }

    let materiasCount = 0;
    let unidadesCount = 0;
    let sucursalesCount = 0;

    for (const item of data.data) {
      // Insertar materia prima
      await db.runAsync(
        `INSERT OR IGNORE INTO MATERIA_PRIMA (UUID, NOMBRE) VALUES (?, ?)`,
        [item.id, item.name],
      );
      materiasCount++;

      // Insertar por sucursal
      for (const sucursal of item.rawMaterialsBranches ?? []) {
        const unidad = sucursal.measurementUnits;
        if (unidad) {
          await db.runAsync(
            `INSERT OR IGNORE INTO UNIDAD_MEDIDA (UUID, NOMBRE, ABREVIACION) VALUES (?, ?, ?)`,
            [unidad.id, unidad.name, unidad.abbreviation],
          );
          unidadesCount++;
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
          ],
        );
        sucursalesCount++;
      }
    }

    console.log(
      `✅ Inventario insertado: ${materiasCount} materias primas, ${unidadesCount} unidades, ${sucursalesCount} sucursales`,
    );
    return true;
  }
}
