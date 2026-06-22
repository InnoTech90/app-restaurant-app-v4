import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import Loading from "../../../components/atoms/Loading/Loading";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import { gb } from "../../globalStyles";
import { integracionPantallaDeCarga } from "./integracion";
import { s } from "./styles";



const PantallaDeCarga = () => {
    const authContext = useContext(AuthContext);
    const reouter = useRouter();

    const [modalError, setModalError] = useState(false);
    const [endpontsCargados, setEndpointsCargados] = useState(
        {
            general: null,
            table: null,
            clientes: null,
            inventory: null,
            menu: null,
            configuraciones: null,
            historialCaja: null,
            comanda: null,
            gastos:null,
            metodo_pago:null
        }
    );
    // peticiones a la api
    const getGeneral = async () => {
        try {
            const res = await integracionPantallaDeCarga.general();

            // paymentMethods ahora llega dentro de /devices/general.
            setEndpointsCargados(prev => ({ ...prev, general: true, metodo_pago: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga general:", err);
            setModalError(true); // ✅ Muestra el modal
        }
    };
    const getTables = async () => {
        try {
            const res = await integracionPantallaDeCarga.table();
            // console.log("res",JSON.stringify(res,null,2));
            

            setEndpointsCargados(prev => ({ ...prev, table: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga table:", err);
            setModalError(true); // ✅ Muestra el modal
        }
    };
    const getClientes = async () => {
        try {
            const res = await integracionPantallaDeCarga.clientes();

            setEndpointsCargados(prev => ({ ...prev, clientes: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga clientes:", err);
            setModalError(true); // ✅ Muestra el modal
        }
    };
    const getInventory = async () => {
        try {
            const res = await integracionPantallaDeCarga.inventory();
            setEndpointsCargados(prev => ({ ...prev, inventory: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga inventory:", err);
            setModalError(true); // ✅ Muestra el modal
        }
    };
    const getMenu = async () => {
        try {
            const res = await integracionPantallaDeCarga.menu();
            setEndpointsCargados(prev => ({ ...prev, menu: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga menu:", err);
            setModalError(true);
        }
    };
    const getGastos  = async () => {
        try {
            const res = await integracionPantallaDeCarga.gastos();
            setEndpointsCargados(prev => ({ ...prev, gastos: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga gastos:", err);
            setModalError(true);
        }
    };
    const getConfiguraciones = async () => {
        try {
            const res = await integracionPantallaDeCarga.configuraciones();
            setEndpointsCargados(prev => ({ ...prev, configuraciones: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga configuraciones:", err);
            setModalError(true);
        }
    };
    const getHistorialCaja = async () => {
        try {
            const res = await integracionPantallaDeCarga.historialCaja();
            setEndpointsCargados(prev => ({ ...prev, historialCaja: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga historialCaja:", err);
            setModalError(true);
        }
    };
    const createComandaTable = async () => {
        try {
            const res = await integracionPantallaDeCarga.comandaTable();
            setEndpointsCargados(prev => ({ ...prev, comanda: true }));
        } catch (err) {
            console.error("Error en la integración de PantallaDeCarga comandaTable:", err);
            setModalError(true);
        }
    };

    // inicializacion y carga de todo
    useEffect(() => {
        if (authContext.isReady) {
            const initialize = async () => {
                await getGeneral();
                await getTables();
                await getClientes();
                await getInventory();
                await getMenu();
                await getGastos();
                await getConfiguraciones();
                await getHistorialCaja();
                await createComandaTable();
            }
            initialize();
        }
    }, [authContext.isReady]);
    // cuando ya este todo cargado me va a redirigir al login
    useEffect(() => {
        if (endpontsCargados.table &&
            endpontsCargados.general &&
            endpontsCargados.clientes &&
            endpontsCargados.inventory &&
            endpontsCargados.menu &&
            endpontsCargados.gastos &&
            endpontsCargados.configuraciones&&
            endpontsCargados.historialCaja&&
            endpontsCargados.comanda&&  
            endpontsCargados.metodo_pago
        ) {
            reouter.replace("/Inicio");

        }
    }, [endpontsCargados]);

    if (!authContext.isReady) {
        return null;
    }

    return (
        <View>
            <Image source={require("../../../assets/img/background_registro.png")} style={s.Background} />
            <View style={s.main}>
                <View style={s.logoContainer}>
                    <Image source={require("../../../assets/img/logo_app_rest_blanco.png")} style={s.logoImage} />
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

            {/* Modal de error */}
            <GeneralModal visible={modalError} onRequestClose={() => setModalError(false)}>
                <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Error de conexión</Text>
                <Text style={{ marginBottom: 16 }}>No se pudo conectar al servidor. Por favor intenta de nuevo.</Text>
                <Button onPress={() => {
                    setModalError(false);
                    authContext.desautenticar(); // ✅ Desautentica al cerrar
                }}>
                    <Text style={{ color: gb.gray50 }}>Aceptar</Text>
                </Button>
            </GeneralModal>
        </View>
    );
}
export default PantallaDeCarga;
