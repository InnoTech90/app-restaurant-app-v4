import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { dataBase } from "../components/Molecules/NipModal/database";
import { sesionPuedeEntrar } from "./gerentePermisos";
import { autorizarSeccion, tieneAccesoSeccion } from "./sectionAccess";

export function useProteccionConfig({
  seccion,
  configFlag,
  tituloModal,
  keywords = [],
}) {
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [modalAcceso, setModalAcceso] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const keywordsClave = keywords.join(",");

      const verificarAcceso = async () => {
        const configuraciones = await dataBase.getConfiguracionesModel();
        const config = configuraciones?.[0];
        const modoRestrictivo = !!config?.[configFlag];
        const pantalla = { keywords: keywordsClave ? keywordsClave.split(",") : [] };

        if (!modoRestrictivo) {
          const permitido = await sesionPuedeEntrar(pantalla);
          if (!activo) return;
          if (!permitido) {
            setAccesoPermitido(false);
            setModalAcceso(false);
            Alert.alert(
              "Sin permiso",
              "No tiene permisos para acceder a esta opción.",
              [
                {
                  text: "Aceptar",
                  onPress: () => {
                    if (router.canGoBack()) router.back();
                    else router.replace("/Inicio");
                  },
                },
              ],
            );
            return;
          }
          setAccesoPermitido(true);
          setModalAcceso(false);
          return;
        }

        if (tieneAccesoSeccion(seccion)) {
          if (activo) {
            setAccesoPermitido(true);
            setModalAcceso(false);
          }
          return;
        }

        if (activo) {
          setAccesoPermitido(false);
          setModalAcceso(true);
        }
      };

      verificarAcceso();
      return () => {
        activo = false;
      };
    }, [seccion, configFlag, keywords.join(",")]),
  );

  const onAccesoCorrecto = useCallback(async () => {
    autorizarSeccion(seccion);
    setAccesoPermitido(true);
    setModalAcceso(false);
  }, [seccion]);

  const onAccesoCancelado = useCallback(() => {
    setModalAcceso(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/Inicio");
    }
  }, []);

  return {
    accesoPermitido,
    modalAcceso,
    onAccesoCorrecto,
    onAccesoCancelado,
    tituloModal,
  };
}
