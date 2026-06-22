import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { integracionPantallaDeCarga } from "../PantallaDeCarga/integracion";
import { Database } from "./Database";

const API_URL = "https://api.apprestaurants.com/v1";

export class integracionClientes {
    /**
     * Actualizar: descarga los clientes desde el servidor y los guarda en BD local.
     */
    static actualizar = async () => {
        await integracionPantallaDeCarga.clientes();
    };

    /**
     * Sincronizar: sube todos los clientes con SINCRONIZADO = 0.
     *
     * Flujo:
     *  1. Obtiene clientes pendientes.
     *  2. Construye payload: dinerId solo para los que ya tienen UUID (editados),
     *     omitido para los nuevos (creados localmente sin UUID).
     *  3. POST /devices/synchronize-diners.
     *  4. Marca como SINCRONIZADO = 1 los que tenían UUID.
     *  5. Elimina localmente los recién creados (sin UUID) — el servidor los
     *     devuelve con UUID asignado en el siguiente paso.
     *  6. Llama actualizar() para traer los datos frescos del servidor.
     *
     * @returns {{ sincronizados: number }}
     */
    static sincronizar = async () => {
        const pendientes = await Database.getClientesPendientes();
        if (!pendientes?.length) return { sincronizados: 0 };

        const businessId = await Database.getBusinessId();
        const deviceKey = await AsyncStorage.getItem("deviceKey");
        const qrCode = await AsyncStorage.getItem("qrCode");

        const records = pendientes.map((c) => {
            const record = {
                name: c.NOMBRE,
                address: c.DIRECCION ?? "",
                city: c.CIUDAD ?? "",
                state: c.ESTADO ?? "",
                whatsapp: c.WHATSAPP ?? "",
                email: c.CORREO ?? "",
                note: c.NOTAS ?? "",
            };
            // dinerId solo para clientes que ya existen en el servidor
            if (c.UUID) record.dinerId = c.UUID;
            return record;
        });
        const params = {
            businessId,
            records,
        };
        // console.log("params", JSON.stringify(params, null, 2));
        console.log("pendientes", JSON.stringify(pendientes, null, 2));


        await axios.post(
            `${API_URL}/devices/synchronize-diners`,
            JSON.stringify(params, null, 2),
            {
                headers: {
                    "device-key": deviceKey,
                    "x-api-key": qrCode,
                    "Content-Type": "application/json",
                },
            }
        );

        // Marcar editados como sincronizados
        const uuidsExistentes = pendientes.filter((c) => c.UUID).map((c) => c.UUID);
        await Database.marcarSincronizadosPorUUID(uuidsExistentes);

        // Eliminar los creados localmente (sin UUID); el servidor los devolverá con UUID
        await Database.eliminarClientesSinUUID();

        // Traer datos frescos del servidor
        await integracionClientes.actualizar();

        return { sincronizados: pendientes.length };
    };
}
