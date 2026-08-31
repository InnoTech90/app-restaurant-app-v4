import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const verificarConexionInternet = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
};

export const esErrorDeConexion = (error) => {
    const mensaje = String(error?.message ?? '').toLowerCase();
    return (
        mensaje.includes('network error') ||
        error?.code === 'ERR_NETWORK' ||
        error?.code === 'ECONNABORTED'
    );
};

/**
 * Hook para detectar el estado de conexión a internet.
 *
 * @returns {{
 *   isConnected: boolean,
 *   isInternetReachable: boolean | null,
 *   type: string | null,
 *   isWifi: boolean,
 *   isCellular: boolean,
 *   cargando: boolean
 * }}
 *
 * @example
 * const { isConnected, cargando } = useConeccionAInternet();
 * if (cargando) return <ActivityIndicator />;
 * if (!isConnected) return <Text>Sin internet</Text>;
 */
const useConeccionAInternet = () => {
    const [estado, setEstado] = useState({
        isConnected: false,
        isInternetReachable: null,
        type: null,
        isWifi: false,
        isCellular: false,
        cargando: true,
    });

    useEffect(() => {
        const actualizarEstado = (state) => {
            setEstado({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
                isWifi: state.type === 'wifi',
                isCellular: state.type === 'cellular',
                cargando: false,
            });
        };

        // Obtener estado inicial inmediatamente
        NetInfo.fetch().then(actualizarEstado);

        // Suscribirse a cambios en tiempo real
        const unsubscribe = NetInfo.addEventListener(actualizarEstado);

        // Limpiar suscripcion al desmontar
        return () => unsubscribe();
    }, []);

    return estado;
};

export default useConeccionAInternet;
