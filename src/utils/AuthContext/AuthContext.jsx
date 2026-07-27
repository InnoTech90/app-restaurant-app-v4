import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();
export const AuthContext = createContext({
  autenticado: false,
  isReady: false,
  autenticar: () => {},
  desautenticar: () => {},
});

const dataAuthStorage = "authData";

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
    const getAuthSorage = async () => {
      await new Promise((resolve) => setTimeout(() => resolve(null), 1000));
      try {
        const value = await AsyncStorage.getItem(dataAuthStorage);
        if (value !== null) {
          const parsedValue = JSON.parse(value);

          setAutenticado(parsedValue.autenticado);
        }
      } catch (error) {
        console.error("Error al obtener el estado de autenticación:", error);
      }
      setIsReady(true);
    };
    getAuthSorage();
  }, []);
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  const autenticar = () => {
    storageAuthState({ autenticado: true, data: [] });
    setAutenticado(true);
    router.replace("/PantallaDeCarga");
  };
  const desautenticar = () => {
    setAutenticado(false);
    storageAuthState({ autenticado: false, data: [] });
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
