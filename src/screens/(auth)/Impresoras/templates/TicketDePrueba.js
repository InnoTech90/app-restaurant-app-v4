  import { Alert } from 'react-native';
import { BluetoothEscposPrinter, BluetoothManager } from 'react-native-bluetooth-escpos-printer';
  // ── Prueba de impresión MP-210 ────────────────────────────────────────────
   export const handleTest = async (punto) => {
        try {
            await BluetoothManager.connect(punto.ID_IMPRESORA);
            await BluetoothEscposPrinter.printerInit();
            await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER
            );
            await BluetoothEscposPrinter.printText("PRUEBA DE IMPRESION\n", {
                widthtimes: 1,
                heigthtimes: 1,
            });
            await BluetoothEscposPrinter.printText(
                "========================\n",
                {}
            );
            await BluetoothEscposPrinter.printText(`${punto.NOMBRE}\n`, {
                widthtimes: 1,
                heigthtimes: 1,
            });
            await BluetoothEscposPrinter.printText(
                "========================\n",
                {}
            );
            await BluetoothEscposPrinter.printText("Impresora lista  OK\n", {});
            await BluetoothEscposPrinter.printText("MP-210\n\n\n", {});
        } catch (e) {
            Alert.alert(
                "Error de impresión",
                "No se pudo conectar con la impresora. Verifica que esté encendida y en rango."
            );
        }
    };