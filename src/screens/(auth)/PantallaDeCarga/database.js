import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDb } from "../../../utils/db";

const normalizeNip = (value) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const CONFIGURACIONES_DEFAULTS = {
  nombreDispositivo: "Dispositivo",
  abiertoPedidos: 1,
  imprimirFicha: 1,
  soloProductosNuevos: 0,
  idTamanoFuente: 2,
  costoEnvio: 0,
  impuestos: 0,
  descuentos: 0,
  idFormatoPago: 1,
  protegerVentas: 0,
  nipFinalizarTicket: 0,
  modoRestrictivo: 0,
  habilitarEdicionTicket: 1,
};

/**
 * Database
 * IMPORTANTE: No crea tablas aquí. Las tablas son creadas por DatabaseInitializer.
 * Este archivo solo se encarga de INSERTAR/ACTUALIZAR datos desde la API.
 */
export class Database {
  static getConfigContextFromGeneral(data) {
    const { branch, business } = data ?? {};
    return {
      idSucursal: branch?.qrCode ?? null,
      nip: normalizeNip(business?.nip ?? business?.NIP),
    };
  }

  /**
   * Asegura fila en CONFIGURACIONES para la sucursal.
   * Siempre crea la fila (aunque el NIP aún no venga); actualiza NIP cuando sí llega.
   */
  static async persistNipConfiguracion(db, { idSucursal, nip }) {
    if (!idSucursal) return;

    const nipValor = normalizeNip(nip);
    const existing = await db.getFirstAsync(
      `SELECT ID_SUCURSAL FROM CONFIGURACIONES WHERE ID_SUCURSAL = ?`,
      [idSucursal],
    );

    if (existing) {
      if (nipValor != null) {
        await db.runAsync(
          `UPDATE CONFIGURACIONES SET NIP = ? WHERE ID_SUCURSAL = ?`,
          [nipValor, idSucursal],
        );
      }
      return;
    }

    const d = CONFIGURACIONES_DEFAULTS;
    await db.runAsync(
      `INSERT OR IGNORE INTO CONFIGURACIONES (
        ID_SUCURSAL, NOMBRE_DISPOCITIVO, ABIERTO_PEDIDOS, IMPRIMIR_FICHA,
        SOLO_PRODUCTOS_NUEVOS, ID_TAMAÑO_FUENTE, COSTO_ENVIO, IMPUESTOS,
        DESCUENTOS, ID_FORMATO_PAGO, PROTEGER_VENTAS, NIP_FINALIZAR_TICKET,
        MODO_RESTRICTIVO, HABILITAR_EDICION_TICKET, NIP
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idSucursal,
        d.nombreDispositivo,
        d.abiertoPedidos,
        d.imprimirFicha,
        d.soloProductosNuevos,
        d.idTamanoFuente,
        d.costoEnvio,
        d.impuestos,
        d.descuentos,
        d.idFormatoPago,
        d.protegerVentas,
        d.nipFinalizarTicket,
        d.modoRestrictivo,
        d.habilitarEdicionTicket,
        nipValor,
      ],
    );
  }

  /**
   * Inserta datos generales (dispositivo, sucursal, negocio, plan, etc.)
   * Sin crear tablas - asume que ya existen
   */
  static async generalModel(data) {
    const db = await getDb();

    const { device, branch, business, plan, printPoints } = data;
    const idSucursal = branch?.qrCode ?? (await AsyncStorage.getItem("qrCode"));
    const nipNegocio = normalizeNip(business?.nip ?? business?.NIP);

    // Mantener AsyncStorage alineado con el QR de la API (NipModal filtra por este valor).
    if (branch?.qrCode) {
      await AsyncStorage.setItem("qrCode", String(branch.qrCode));
    }

    // Insertar punto de impresión por defecto si no existe
    await db.runAsync(
      `INSERT INTO PUNTOS_IMPRESION (UUID, NOMBRE, ID_SUCURSAL)
       VALUES (?, ?, ?)
       ON CONFLICT(UUID) DO UPDATE SET
         NOMBRE = excluded.NOMBRE,
         ID_SUCURSAL = excluded.ID_SUCURSAL`,
      ["PRIMER_PUNTO", "Caja", branch.id],
    );

    // Insertar puntos de impresión adicionales
    if (Array.isArray(printPoints) && printPoints.length > 0) {
      for (const pp of printPoints) {
        await db.runAsync(
          `INSERT INTO PUNTOS_IMPRESION (UUID, NOMBRE, ID_SUCURSAL)
           VALUES (?, ?, ?)
           ON CONFLICT(UUID) DO UPDATE SET
             NOMBRE = excluded.NOMBRE,
             ID_SUCURSAL = excluded.ID_SUCURSAL`,
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

    await Database.managersModel(db, data?.managers);

    await Database.persistNipConfiguracion(db, {
      idSucursal,
      nip: nipNegocio,
    });

    // Categorías y conceptos de gasto vienen en general.expenseGroups
    await Database.gastosModel(data?.expenseGroups);

    console.log("✅ Datos generales insertados correctamente");
  }

  /**
   * Sincroniza gerentes y sus permisos desde /devices/general.
   * Reemplaza el snapshot local para reflejar altas/bajas del API.
   */
  static async managersModel(db, managers) {
    if (!Array.isArray(managers)) {
      console.log("⚠️  No hay managers en la respuesta general");
      return;
    }

    await db.runAsync(`DELETE FROM GERENTE_PERMISOS`);
    await db.runAsync(`DELETE FROM GERENTES`);

    let gerentesCount = 0;
    let permisosCount = 0;

    for (const manager of managers) {
      if (!manager?.id) continue;

      const nip =
        manager.nip != null && manager.nip !== "" ? String(manager.nip) : null;

      await db.runAsync(
        `INSERT INTO GERENTES (UUID, NAME, NIP, ACTIVO) VALUES (?, ?, ?, 1)`,
        [manager.id, manager.name ?? null, nip],
      );
      gerentesCount++;

      const permisos = Array.isArray(manager.permissions)
        ? manager.permissions
        : [];

      for (const permiso of permisos) {
        const keyword = permiso?.keyWord ?? permiso?.keyword ?? null;
        if (!keyword) continue;

        await db.runAsync(
          `INSERT OR IGNORE INTO GERENTE_PERMISOS (ID_GERENTE, NOMBRE, KEYWORD)
           VALUES (?, ?, ?)`,
          [manager.id, permiso.name ?? null, String(keyword)],
        );
        permisosCount++;
      }
    }

    console.log(
      `✅ Gerentes sincronizados: ${gerentesCount} gerentes, ${permisosCount} permisos`,
    );
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
   * Inserta categorías (expenseGroups) y conceptos (concepts) de gasto.
   * expenseGroup → CATEGORIA_GASTO
   * concept → CONCEPTO_GASTO (ID_CATEGORIA = group.id)
   */
  static async gastosModel(data) {
    const db = await getDb();

    const categorias = Array.isArray(data)
      ? data
      : (data?.expenseGroups ?? data?.data ?? []);

    if (!Array.isArray(categorias) || categorias.length === 0) {
      console.log("⚠️  No hay expenseGroups para insertar");
      return;
    }

    let categoriasCount = 0;
    let conceptosCount = 0;

    for (const categoria of categorias) {
      if (!categoria?.id) continue;

      await db.runAsync(
        `INSERT INTO CATEGORIA_GASTO (UUID, NOMBRE, DESCRIPCION, SINCRONIZADO)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(UUID) DO UPDATE SET
           NOMBRE = excluded.NOMBRE,
           DESCRIPCION = excluded.DESCRIPCION,
           SINCRONIZADO = 1`,
        [
          categoria.id,
          categoria.name ?? "",
          categoria.description ?? null,
        ],
      );
      categoriasCount++;

      for (const concepto of categoria.concepts || []) {
        if (!concepto?.id) continue;

        await db.runAsync(
          `INSERT INTO CONCEPTO_GASTO
             (UUID, ID_CATEGORIA, NOMBRE, DESCRIPCION, PRECIO, SINCRONIZADO)
           VALUES (?, ?, ?, ?, ?, 1)
           ON CONFLICT(UUID) DO UPDATE SET
             ID_CATEGORIA = excluded.ID_CATEGORIA,
             NOMBRE = excluded.NOMBRE,
             DESCRIPCION = excluded.DESCRIPCION,
             SINCRONIZADO = 1`,
          [
            concepto.id,
            categoria.id,
            concepto.name ?? "",
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
   * Asegura fila de CONFIGURACIONES con NIP del negocio.
   * Recibe contexto explícito de general() para evitar estado global entre llamadas.
   */
  static async configuracionesModel({ idSucursal, nip } = {}) {
    const qrData = idSucursal ?? (await AsyncStorage.getItem("qrCode"));
    const db = await getDb();

    await Database.persistNipConfiguracion(db, {
      idSucursal: qrData,
      nip,
    });

    console.log("✅ Configuraciones sincronizadas correctamente");
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
