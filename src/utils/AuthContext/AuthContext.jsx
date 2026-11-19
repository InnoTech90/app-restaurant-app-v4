import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  autenticado: false,
  isReady: false,
  autenticar: () => {},
  desautenticar: () => {},
});

const dataAuthStorage = "authData";

/**
 * "0" mientras PantallaDeCarga descarga los datos; "1" cuando terminó todo.
 * Si la app se cerró o el backend se cayó a media carga, al volver a abrir
 * la base local está incompleta y todo salía vacío: con "0" se cierra sesión
 * y se manda al login. Sin la clave (instalaciones anteriores) no se toca.
 */
export const CARGA_INICIAL_KEY = "cargaInicialCompleta";

export const marcarCargaInicialCompleta = () =>
  AsyncStorage.setItem(CARGA_INICIAL_KEY, "1");

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [autenticado, setAutenticado] = useState(false);

  const storageAuthState = async ({ autenticado, data }) => {
    try {
      await AsyncStorage.setItem(
        dataAuthStorage,
        JSON.stringify({ autenticado, data }),
      );
    } catch (error) {
      console.error("Error al almacenar el estado de autenticación:", error);
    }
  };

  useEffect(() => {
    const loadLocalSession = async () => {
      try {
        const value = await AsyncStorage.getItem(dataAuthStorage);
        if (value !== null) {
          const parsedValue = JSON.parse(value);
          const cargaInicial = await AsyncStorage.getItem(CARGA_INICIAL_KEY);
          const cargaIncompleta = cargaInicial === "0";
          if (parsedValue.autenticado === true && cargaIncompleta) {
            await storageAuthState({ autenticado: false, data: [] });
            setAutenticado(false);
          } else {
            setAutenticado(parsedValue.autenticado === true);
          }
        }
        // Limpia sesión de gerente legacy si existía.
        await AsyncStorage.removeItem("gerenteSesion");
      } catch (error) {
        console.error("Error recuperando la sesión local:", error);
      } finally {
        setIsReady(true);
      }
    };
    loadLocalSession();
  }, []);

  const autenticar = async () => {
    await AsyncStorage.setItem(CARGA_INICIAL_KEY, "0");
    await storageAuthState({ autenticado: true, data: [] });
    setAutenticado(true);
    router.replace("/PantallaDeCarga");
  };

  const desautenticar = async () => {
    setAutenticado(false);
    await storageAuthState({ autenticado: false, data: [] });
    await AsyncStorage.removeItem("gerenteSesion");
    router.replace("/Login");
  };

  return (
    <AuthContext.Provider
      value={{ isReady, autenticado, autenticar, desautenticar }}
    >
      {children}
    </AuthContext.Provider>
  );
};
