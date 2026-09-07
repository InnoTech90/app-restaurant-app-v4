import { NativeModules } from "react-native";

export const MENSAJE_BT_NO_DISPONIBLE =
  "La impresión Bluetooth no está disponible. Usa el APK nativo instalado en el dispositivo (no Expo Go).";

const attachEscposConstants = (printer) => {
  if (!printer || printer.ALIGN) return printer;

  printer.ERROR_CORRECTION = { L: 1, M: 0, Q: 3, H: 2 };
  printer.BARCODETYPE = {
    UPC_A: 65,
    UPC_E: 66,
    JAN13: 67,
    JAN8: 68,
    CODE39: 69,
    ITF: 70,
    CODABAR: 71,
    CODE93: 72,
    CODE128: 73,
  };
  printer.ROTATION = { OFF: 0, ON: 1 };
  printer.ALIGN = { LEFT: 0, CENTER: 1, RIGHT: 2 };

  return printer;
};

/** Acceso directo a NativeModules; evita el index.js roto del paquete npm. */
export const BluetoothManager = NativeModules.BluetoothManager ?? null;
export const BluetoothEscposPrinter = attachEscposConstants(
  NativeModules.BluetoothEscposPrinter ?? null,
);

export const isBluetoothEscposDisponible = () =>
  Boolean(BluetoothManager && BluetoothEscposPrinter);

export const assertBluetoothEscposDisponible = () => {
  if (!isBluetoothEscposDisponible()) {
    throw new Error(MENSAJE_BT_NO_DISPONIBLE);
  }
};
