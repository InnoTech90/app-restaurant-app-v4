import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { dataBase } from "../components/Molecules/NipModal/database";
import { autorizarSeccion, tieneAccesoSeccion } from "./sectionAccess";

export function useProteccionConfig({
  seccion,
  configFlag,
  tituloModal,
}) {
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [modalAcceso, setModalAcceso] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const verificarAcceso = async () => {
        const configuraciones = await dataBase.getConfiguracionesModel();
        const config = configuraciones?.[0];

        if (!config?.[configFlag] || tieneAccesoSeccion(seccion)) {
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
    }, [seccion, configFlag]),
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
