import { withDb } from "../../../utils/db";

export class dataBase {
    static getConfiguracionesModel = async () => {
        return withDb(async (db) => {
            const configuraciones = await db.getAllAsync(`SELECT * FROM CONFIGURACIONES`);
            return configuraciones;
        });
    }
}
