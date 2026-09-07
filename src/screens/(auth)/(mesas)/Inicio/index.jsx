import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Mesa from "../../../../components/Molecules/Mesa/Mesa";
import {
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../../utils/ConeccionAInternet/ConeccionAInternet";
import { initializeSchema } from "../../../../utils/db";
import { gb } from "../../../globalStyles";
import { Database } from "./database";
import { s } from "./styles";

const Inicio = () => {
  const router = useRouter();
  const [mesas, setMesas] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getMesas();
  }, []);

  const getMesas = async () => {
    try {
      await initializeSchema();
      const mesasdb = await Database.getMesas();
      setMesas(mesasdb);
    } catch (error) {
      console.error("❌ Error obteniendo mesas:", error);
    }
  };

  /**
   * Manejador del pull-to-refresh
   * Obtiene mesas actualizadas desde la API y las guarda en la BD
   */
  const onRefresh = useCallback(async () => {
    const hayInternet = await verificarConexionInternet();
    if (!hayInternet) {
      Alert.alert("Sin conexión", MENSAJE_SIN_INTERNET);
      return;
    }

    setIsRefreshing(true);
    try {
      console.log("🔄 Actualizando mesas...");
      const mesasActualizadas = await Database.actualizarMesasDesdeAPI();
      setMesas(mesasActualizadas);
      console.log(`✅ Mesas actualizadas: ${mesasActualizadas.length} mesas`);
    } catch (error) {
      console.error("❌ Error durante refresh:", error);
      Alert.alert(
        "Error",
        obtenerMensajeErrorRed(error, "No se pudieron actualizar las mesas."),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const seleccionarMesa = async (mesa) => {
    await AsyncStorage.setItem("MesaSeleccionada", mesa.UUID);
    router.push(`/Menu Principal?id_mesa=${mesa.UUID}`);
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: gb.gray50 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[gb.blue550]}
            progressBackgroundColor={gb.gray50}
            tintColor={gb.blue550}
          />
        }
      >
        <View style={s.mesasContainer}>
          {mesas.map((mesa, index) => (
            <Mesa
              key={mesa.ID}
              id={mesa.ID}
              nombre={mesa.NOMBRE}
              descripcion={mesa.DESCRIPCION}
              status={mesa.TIENE_COMANDA_ACTIVA === 1}
              onPress={() => seleccionarMesa(mesa)}
              index={index + 1}
              mesas={mesas}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Inicio;
