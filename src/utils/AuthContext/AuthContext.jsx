import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  autenticado: false,
  isReady: false,
  gerenteSesion: null,
  autenticar: () => {},
  desautenticar: () => {},
  iniciarSesionGerente: () => {},
  cerrarSesionGerente: () => {},
});

const dataAuthStorage = "authData";
const gerenteStorage = "gerenteSesion";

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [gerenteSesion, setGerenteSesion] = useState(null);

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

  const storageGerenteSesion = async (sesion) => {
    try {
      if (sesion) {
        await AsyncStorage.setItem(gerenteStorage, JSON.stringify(sesion));
      } else {
        await AsyncStorage.removeItem(gerenteStorage);
      }
    } catch (error) {
      console.error("Error al almacenar sesión de gerente:", error);
    }
  };

  useEffect(() => {
    const loadLocalSession = async () => {
      try {
        const value = await AsyncStorage.getItem(dataAuthStorage);
        if (value !== null) {
          const parsedValue = JSON.parse(value);
          setAutenticado(parsedValue.autenticado === true);
        }

        const gerenteValue = await AsyncStorage.getItem(gerenteStorage);
        if (gerenteValue !== null) {
          setGerenteSesion(JSON.parse(gerenteValue));
        }
      } catch (error) {
        console.error("Error recuperando la sesión local:", error);
      } finally {
        setIsReady(true);
      }
    };
    loadLocalSession();
  }, []);

  const autenticar = async () => {
    await storageAuthState({ autenticado: true, data: [] });
    setAutenticado(true);
    await storageGerenteSesion(null);
    setGerenteSesion(null);
    router.replace("/PantallaDeCarga");
  };

  const desautenticar = async () => {
    setAutenticado(false);
    setGerenteSesion(null);
    await storageAuthState({ autenticado: false, data: [] });
    await storageGerenteSesion(null);
    router.replace("/Login");
  };

  const iniciarSesionGerente = async (sesion) => {
    setGerenteSesion(sesion);
    await storageGerenteSesion(sesion);
    router.replace("/Inicio");
  };

  const cerrarSesionGerente = async () => {
    setGerenteSesion(null);
    await storageGerenteSesion(null);
    router.replace("/LoginGerente");
  };

  return (
    <AuthContext.Provider
      value={{
        isReady,
        autenticado,
        gerenteSesion,
        autenticar,
        desautenticar,
        iniciarSesionGerente,
        cerrarSesionGerente,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
