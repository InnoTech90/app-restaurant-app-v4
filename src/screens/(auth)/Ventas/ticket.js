import { Alert, PermissionsAndroid, Platform } from "react-native";
import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from "react-native-bluetooth-escpos-printer";
import { withDb } from "../../../utils/db";

// ─────────────────────────────────────────────────────────────────────────────
//  Utilidades
// ─────────────────────────────────────────────────────────────────────────────
const COL_WIDTH = 32;
const SEP = "--------------------------------\n";
const fmt$ = (val) => `$${(val ?? 0).toFixed(2)}`;

const padLine = (left, right) => {
  const maxLeft = COL_WIDTH - right.length - 1;
  const trimmed =
    left.length > maxLeft ? left.slice(0, maxLeft - 1) + "." : left;
  const spaces = COL_WIDTH - trimmed.length - right.length;
  return trimmed + " ".repeat(Math.max(1, spaces)) + right;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const desconectarImpresora = async () => {
  try {
    await BluetoothManager.disconnect();
  } catch {}
};

const getPrinterCaja = async () => {
  return withDb("VentasTicket.getPrinterCaja", async (db) => {
    return db.getFirstAsync(
      `SELECT * FROM PUNTOS_IMPRESION WHERE UUID = 'PRIMER_PUNTO' LIMIT 1`,
    );
  });
};

const conectar = async (idImpresora) => {
  try {
    await BluetoothManager.connect(idImpresora);
  } catch {
    await sleep(1000);
    await BluetoothManager.connect(idImpresora);
  }
};

const fmtHora = (fechaStr) => {
  if (!fechaStr) return "-";
  const partes = fechaStr.split(" ");
  return partes[1]?.slice(0, 5) ?? "-";
};

// ─────────────────────────────────────────────────────────────────────────────
//  Exports públicos
// ─────────────────────────────────────────────────────────────────────────────

export const imprimirCorteResumen = (datos) => _imprimir(datos, "RESUMEN");
export const imprimirCorteGeneral = (datos) => _imprimir(datos, "GENERAL");

// ─────────────────────────────────────────────────────────────────────────────
//  Implementación
// ─────────────────────────────────────────────────────────────────────────────
const _imprimir = async (datos, tipo) => {
  try {
    // Permisos BT
    if (Platform.OS === "android" && Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    } else if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          "Permiso requerido",
          "Se necesita acceso a Bluetooth para imprimir.",
        );
        return false;
      }
    }

    const printer = await getPrinterCaja();
    if (!printer) {
      Alert.alert(
        "Sin punto de caja",
        "No se encontró un punto de impresión de caja configurado.",
      );
      return false;
    }
    if (!printer.ID_IMPRESORA) {
      Alert.alert(
        "Sin impresora",
        "El punto de caja no tiene impresora vinculada.",
      );
      return false;
    }

    const ALIGN = BluetoothEscposPrinter.ALIGN;
    const {
      sucursal,
      porCategoria,
      formasPago,
      adicionales,
      ventas,
      totalEfectivo,
      aperturaCaja,
    } = datos;
    const ahora = new Date();
    const fechaHoy = `${String(ahora.getDate()).padStart(2, "0")}/${String(ahora.getMonth() + 1).padStart(2, "0")}/${ahora.getFullYear()} ${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

    try {
      await conectar(printer.ID_IMPRESORA);
      await BluetoothEscposPrinter.printerInit();

      // ── ENCABEZADO ──────────────────────────────────────────────────
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      const titulo =
        tipo === "RESUMEN" ? "RESUMEN DE VENTAS" : "REPORTE GENERAL";
      await BluetoothEscposPrinter.printText(`${titulo}\n`, {
        widthtimes: 1,
        heigthtimes: 1,
      });
      if (sucursal?.NOMBRE) {
        await BluetoothEscposPrinter.printText(`${sucursal.NOMBRE}\n`, {});
      }
      await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
      if (sucursal?.DIRECCION) {
        await BluetoothEscposPrinter.printText(
          `Dir: ${sucursal.DIRECCION}\n`,
          {},
        );
      }
      if (sucursal?.TELEFONO) {
        await BluetoothEscposPrinter.printText(
          `Tel: ${sucursal.TELEFONO}\n`,
          {},
        );
      }
      await BluetoothEscposPrinter.printText(`Fecha: ${fechaHoy}\n`, {});
      await BluetoothEscposPrinter.printText(
        `Ventas: ${adicionales?.NUM_VENTAS ?? 0}\n`,
        {},
      );
      if (aperturaCaja) {
        await BluetoothEscposPrinter.printText(
          padLine("Apertura caja", fmt$(aperturaCaja.MONTO ?? 0)) + "\n",
          {},
        );
      }
      await BluetoothEscposPrinter.printText(SEP, {});

      // ── VENTA POR CATEGORÍA ─────────────────────────────────────────
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("VENTA POR CATEGORIA\n", {
        widthtimes: 1,
      });
      await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
      let totalCategorias = 0;
      for (const cat of porCategoria ?? []) {
        await BluetoothEscposPrinter.printText(
          padLine(cat.PUNTO_NOMBRE, fmt$(cat.TOTAL_VENDIDO)) + "\n",
          {},
        );
        totalCategorias += cat.TOTAL_VENDIDO ?? 0;
      }
      await BluetoothEscposPrinter.printText(SEP, {});
      await BluetoothEscposPrinter.printText(
        padLine("TOTAL", fmt$(totalCategorias)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(SEP, {});

      // ── VENTAS ──────────────────────────────────────────────────────
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("VENTAS\n", { widthtimes: 1 });
      await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
      await BluetoothEscposPrinter.printText(
        padLine("Total ventas", String(adicionales?.NUM_VENTAS ?? 0)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(
        padLine("Monto total", fmt$(adicionales?.TOTAL_GENERAL ?? 0)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(SEP, {});

      // ── FORMAS DE PAGO ──────────────────────────────────────────────
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("FORMAS DE PAGO\n", {
        widthtimes: 1,
      });
      await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
      for (const fp of formasPago ?? []) {
        await BluetoothEscposPrinter.printText(
          padLine(fp.METODO, fmt$(fp.TOTAL)) + "\n",
          {},
        );
      }
      await BluetoothEscposPrinter.printText(SEP, {});

      // ── ADICIONALES ─────────────────────────────────────────────────
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("ADICIONALES\n", {
        widthtimes: 1,
      });
      await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
      if ((adicionales?.TOTAL_PROPINAS ?? 0) > 0) {
        await BluetoothEscposPrinter.printText(
          padLine("Propinas", fmt$(adicionales.TOTAL_PROPINAS)) + "\n",
          {},
        );
      }
      if ((adicionales?.TOTAL_DESCUENTOS ?? 0) > 0) {
        await BluetoothEscposPrinter.printText(
          padLine("Descuentos", `-${fmt$(adicionales.TOTAL_DESCUENTOS)}`) +
            "\n",
          {},
        );
      }
      if ((adicionales?.TOTAL_ENVIO ?? 0) > 0) {
        await BluetoothEscposPrinter.printText(
          padLine("Costo envio", fmt$(adicionales.TOTAL_ENVIO)) + "\n",
          {},
        );
      }
      await BluetoothEscposPrinter.printText(SEP, {});

      // ── TOTALES FINALES ─────────────────────────────────────────────
      const montoApertura = aperturaCaja?.MONTO ?? 0;
      await BluetoothEscposPrinter.printText(
        padLine("Apertura caja", fmt$(montoApertura)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(
        padLine("Total efectivo", fmt$(totalEfectivo)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(
        padLine("Total en caja", fmt$(montoApertura + totalEfectivo)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(
        padLine("Total general", fmt$(adicionales?.TOTAL_GENERAL ?? 0)) + "\n",
        {},
      );
      await BluetoothEscposPrinter.printText(SEP, {});

      // ── TICKETS INDIVIDUALES (solo GENERAL) ─────────────────────────
      if (tipo === "GENERAL" && (ventas?.length ?? 0) > 0) {
        await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
        await BluetoothEscposPrinter.printText("TICKETS\n", { widthtimes: 1 });
        await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
        for (const v of ventas) {
          const hora = fmtHora(v.FECHA);
          const metodo = v.FORMATO_PAGO ? ` (${v.FORMATO_PAGO})` : "";
          await BluetoothEscposPrinter.printText(
            padLine(`#${v.FICHA}  ${hora}${metodo}`, fmt$(v.TOTAL)) + "\n",
            {},
          );
        }
        await BluetoothEscposPrinter.printText(SEP, {});
      }

      // ── CIERRE ──────────────────────────────────────────────────────
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("\n\n\n", {});
      return true;
    } finally {
      await desconectarImpresora();
    }
  } catch (e) {
    console.error("Error en imprimirCorte:", e);
    Alert.alert("Error", "Ocurrió un error al intentar imprimir el corte.");
    return false;
  }
};
