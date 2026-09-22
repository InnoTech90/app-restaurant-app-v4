import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Mesa from "../../../../components/Molecules/Mesa/Mesa";
import {
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../../utils/ConeccionAInternet/ConeccionAInternet";
import {
  clearAuthHeaderTitulo,
  setAuthHeaderTitulo,
} from "../../../../utils/authHeaderTitle";
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

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiRemove([
        "MesaSeleccionada",
        "MesaSeleccionadaNombre",
      ]).catch(() => {});
      clearAuthHeaderTitulo();
      getMesas();
    }, []),
  );

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
    await AsyncStorage.setItem(
      "MesaSeleccionadaNombre",
      mesa.NOMBRE ?? "",
    );
    await setAuthHeaderTitulo("Menu");
    router.push(`/Menu Principal?id_mesa=${mesa.UUID}`);
  };

  const cambiarMesa = async (uuidOrigen, uuidDestino) => {
    await Database.cambiarMesa(uuidOrigen, uuidDestino);
    await getMesas();
  };

  const guardarNotaMesa = async (uuidMesa, nota) => {
    await Database.actualizarNotaMesa(uuidMesa, nota);
    setMesas((prev) =>
      prev.map((m) => (m.UUID === uuidMesa ? { ...m, NOTA: nota } : m)),
    );
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
              key={mesa.UUID ?? mesa.ID}
              id={mesa.ID}
              uuid={mesa.UUID}
              nombre={mesa.NOMBRE}
              descripcion={mesa.DESCRIPCION}
              ficha={mesa.FICHA_COMANDA}
              nota={mesa.NOTA ?? ""}
              status={
                Number(mesa.TIENE_COMANDA_ACTIVA) === 1 ||
                Number(mesa.ESTATUS) === 1
              }
              impresa={Number(mesa.ESTATUS_COMANDA) === 4}
              onPress={() => seleccionarMesa(mesa)}
              index={index + 1}
              mesas={mesas}
              onCambiarMesa={cambiarMesa}
              onGuardarNota={guardarNotaMesa}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Inicio;
