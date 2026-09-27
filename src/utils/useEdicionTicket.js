import { useCallback, useRef, useState } from "react";

/**
 * Si HABILITAR_EDICION_TICKET está activo → no pide NIP.
 * Si está desactivado → pide NIP en cada ajuste.
 * Un campo de texto pide NIP al empezar a escribir y permite
 * seguir en ese campo hasta que pierde el foco.
 */
export function useEdicionTicket(config) {
  const [modalNipEdicion, setModalNipEdicion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const campoAbierto = useRef(false);

  const habilitarEdicion =
    config == null || config.HABILITAR_EDICION_TICKET == null
      ? true
      : !!config.HABILITAR_EDICION_TICKET;

  const puedeEditar = habilitarEdicion;
  const requiereNipEdicion = !habilitarEdicion;

  const solicitarEdicion = useCallback(
    (accion) => {
      if (habilitarEdicion) {
        accion?.();
        return;
      }
      setAccionPendiente(() => accion);
      setModalNipEdicion(true);
    },
    [habilitarEdicion],
  );

  const editarCampo = useCallback(
    (aplicar) => {
      if (habilitarEdicion || campoAbierto.current) {
        aplicar?.();
        return;
      }
      solicitarEdicion(() => {
        campoAbierto.current = true;
        aplicar?.();
      });
    },
    [habilitarEdicion, solicitarEdicion],
  );

  const cerrarCampo = useCallback(() => {
    campoAbierto.current = false;
  }, []);

  const confirmarNipEdicion = useCallback(() => {
    setModalNipEdicion(false);
    const accion = accionPendiente;
    setAccionPendiente(null);
    accion?.();
  }, [accionPendiente]);

  const cerrarNipEdicion = useCallback(() => {
    setModalNipEdicion(false);
    setAccionPendiente(null);
  }, []);

  return {
    puedeEditar,
    requiereNipEdicion,
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    editarCampo,
    cerrarCampo,
    confirmarNipEdicion,
  };
}
