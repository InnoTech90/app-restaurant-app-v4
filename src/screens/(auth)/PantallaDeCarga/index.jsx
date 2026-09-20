import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import Loading from "../../../components/atoms/Loading/Loading";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import {
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { gb } from "../../globalStyles";
import { integracionPantallaDeCarga } from "./integracion";
import { s } from "./styles";

const PantallaDeCarga = () => {
  const authContext = useContext(AuthContext);
  const reouter = useRouter();

  const [modalError, setModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState(
    "No se pudo conectar al servidor. Por favor intenta de nuevo.",
  );
  const [endpontsCargados, setEndpointsCargados] = useState({
    general: null,
    table: null,
    clientes: null,
    inventory: null,
    menu: null,
    configuraciones: null,
    historialCaja: null,
    comanda: null,
    gastos: null,
    metodo_pago: null,
  });

  const mostrarError = useCallback((err, contexto) => {
    console.error(`Error en la integración de PantallaDeCarga ${contexto}:`, err);
    setMensajeError(
      obtenerMensajeErrorRed(
        err,
        "No se pudo conectar al servidor. Por favor intenta de nuevo.",
      ),
    );
    setModalError(true);
  }, []);

  const getGeneral = async () => {
    try {
      const data = await integracionPantallaDeCarga.general();
      setEndpointsCargados((prev) => ({
        ...prev,
        general: true,
        metodo_pago: true,
        // expenseGroups viajan en general y ya se insertan en gastosModel
        gastos: true,
      }));
      return data;
    } catch (err) {
      mostrarError(err, "general");
      return null;
    }
  };

  const getTables = async () => {
    try {
      await integracionPantallaDeCarga.table();
      setEndpointsCargados((prev) => ({ ...prev, table: true }));
    } catch (err) {
      mostrarError(err, "table");
    }
  };

  const getClientes = async () => {
    try {
      await integracionPantallaDeCarga.clientes();
      setEndpointsCargados((prev) => ({ ...prev, clientes: true }));
    } catch (err) {
      mostrarError(err, "clientes");
    }
  };

  const getInventory = async () => {
    try {
      await integracionPantallaDeCarga.inventory();
      setEndpointsCargados((prev) => ({ ...prev, inventory: true }));
    } catch (err) {
      mostrarError(err, "inventory");
    }
  };

  const getMenu = async () => {
    try {
      await integracionPantallaDeCarga.menu();
      setEndpointsCargados((prev) => ({ ...prev, menu: true }));
    } catch (err) {
      mostrarError(err, "menu");
    }
  };

  const getConfiguraciones = async (generalData) => {
    try {
      await integracionPantallaDeCarga.configuraciones(generalData);
      setEndpointsCargados((prev) => ({ ...prev, configuraciones: true }));
    } catch (err) {
      mostrarError(err, "configuraciones");
    }
  };

  const getHistorialCaja = async () => {
    try {
      await integracionPantallaDeCarga.historialCaja();
      setEndpointsCargados((prev) => ({ ...prev, historialCaja: true }));
    } catch (err) {
      mostrarError(err, "historialCaja");
    }
  };

  const createComandaTable = async () => {
    try {
      await integracionPantallaDeCarga.comandaTable();
      setEndpointsCargados((prev) => ({ ...prev, comanda: true }));
    } catch (err) {
      mostrarError(err, "comandaTable");
    }
  };

  useEffect(() => {
    if (!authContext.isReady) return;

    const initialize = async () => {
      try {
        const hayInternet = await verificarConexionInternet();
        if (!hayInternet) {
          setMensajeError(MENSAJE_SIN_INTERNET);
          setModalError(true);
          return;
        }

        console.log("📱 Iniciando inicialización...");
        await integracionPantallaDeCarga.initializeDatabase();
        const generalData = await getGeneral();
        if (!generalData) return;

        await Promise.all([
          getTables(),
          getClientes(),
          getInventory(),
          getMenu(),
        ]);
        await getConfiguraciones(generalData);
        await getHistorialCaja();
        await createComandaTable();
      } catch (error) {
        mostrarError(error, "initialize");
      }
    };

    initialize();
  }, [authContext.isReady, mostrarError]);

  useEffect(() => {
    if (Object.values(endpontsCargados).every((cargado) => cargado === true)) {
      reouter.replace("/Inicio");
    }
  }, [endpontsCargados, reouter]);

  if (!authContext.isReady) {
    return null;
  }

  return (
    <View>
      <Image
        source={require("../../../assets/img/background_registro.png")}
        style={s.Background}
      />
      <View style={s.main}>
        <View style={s.logoContainer}>
          <Image
            source={require("../../../assets/img/logo_app_rest_blanco.png")}
            style={s.logoImage}
          />
        </View>
        <View style={s.loginForm}>
          <View style={s.containerLoading}>
            <Loading color="#ffffff" />
          </View>
          <View style={s.tituloContainer}>
            <Text style={s.titulo}>INICIANDO</Text>
          </View>
        </View>
      </View>

      <GeneralModal
        visible={modalError}
        onRequestClose={() => setModalError(false)}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          Error de conexión
        </Text>
        <Text style={{ marginBottom: 16 }}>{mensajeError}</Text>
        <Button
          onPress={() => {
            setModalError(false);
            authContext.desautenticar();
          }}
        >
          <Text style={{ color: gb.gray50 }}>Aceptar</Text>
        </Button>
      </GeneralModal>
    </View>
  );
};

export default PantallaDeCarga;
