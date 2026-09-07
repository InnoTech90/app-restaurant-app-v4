import { Alert } from 'react-native';
import { BluetoothEscposPrinter } from '../../../../utils/bluetoothEscpos';
import { imprimirConImpresora } from '../Funciones/Impresion';

export const handleTest = async (punto) => {
    if (!punto?.ID_IMPRESORA) {
        Alert.alert("Sin impresora", "Este punto no tiene impresora vinculada.");
        return;
    }

    const ok = await imprimirConImpresora(punto.ID_IMPRESORA, async () => {
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
    });

    if (!ok) {
        Alert.alert(
            "Error de impresión",
            `No se pudo imprimir en "${punto.NOMBRE}". Verifica que la impresora vinculada esté encendida, emparejada en Bluetooth y en rango.`,
        );
    }
};
