import { BluetoothEscposPrinter } from '../../../../utils/bluetoothEscpos';
import { imprimirConImpresora } from '../Funciones/Impresion';

export const imprimirTicketPrueba = (punto, opciones) =>
    imprimirConImpresora(punto.ID_IMPRESORA, async () => {
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText("PRUEBA DE IMPRESION\n", {
            widthtimes: 1,
            heigthtimes: 1,
        });
        await BluetoothEscposPrinter.printText(
            "========================\n",
            {},
        );
        await BluetoothEscposPrinter.printText(`${punto.NOMBRE}\n`, {
            widthtimes: 1,
            heigthtimes: 1,
        });
        await BluetoothEscposPrinter.printText(
            "========================\n",
            {},
        );
        await BluetoothEscposPrinter.printText("Impresora lista  OK\n", {});
        await BluetoothEscposPrinter.printText("MP-210\n\n\n", {});
    }, opciones);
