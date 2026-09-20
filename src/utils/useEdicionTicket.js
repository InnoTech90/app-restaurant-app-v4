import { useCallback, useState } from "react";
import { EdicionTicketStore } from "./edicionTicketStore";

/**
 * Si HABILITAR_EDICION_TICKET está activo → no pide NIP.
 * Si está desactivado → pide NIP en el primer movimiento y autoriza la sesión.
 */
export function useEdicionTicket(config) {
  const [edicionAutorizada, setEdicionAutorizada] = useState(() =>
    EdicionTicketStore.isAutorizado(),
  );
  const [modalNipEdicion, setModalNipEdicion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const habilitarEdicion =
    config == null || config.HABILITAR_EDICION_TICKET == null
      ? true
      : !!config.HABILITAR_EDICION_TICKET;

  const autorizado = habilitarEdicion || edicionAutorizada;
  const puedeEditar = autorizado;
  const requiereNipEdicion = !habilitarEdicion;

  const marcarAutorizado = useCallback(() => {
    EdicionTicketStore.setAutorizado(true);
    setEdicionAutorizada(true);
  }, []);

  const solicitarEdicion = useCallback(
    (accion) => {
      if (habilitarEdicion || EdicionTicketStore.isAutorizado()) {
        if (!edicionAutorizada && EdicionTicketStore.isAutorizado()) {
          setEdicionAutorizada(true);
        }
        accion?.();
        return;
      }
      setAccionPendiente(() => accion);
      setModalNipEdicion(true);
    },
    [habilitarEdicion, edicionAutorizada],
  );

  const confirmarNipEdicion = useCallback(async () => {
    marcarAutorizado();
    setModalNipEdicion(false);
    if (accionPendiente) {
      const accion = accionPendiente;
      setAccionPendiente(null);
      accion?.();
    }
  }, [accionPendiente, marcarAutorizado]);

  const cerrarNipEdicion = useCallback(() => {
    setModalNipEdicion(false);
    setAccionPendiente(null);
  }, []);

  const desbloquearEdicion = useCallback(() => {
    if (habilitarEdicion || EdicionTicketStore.isAutorizado()) {
      if (!edicionAutorizada && EdicionTicketStore.isAutorizado()) {
        setEdicionAutorizada(true);
      }
      return;
    }
    setAccionPendiente(null);
    setModalNipEdicion(true);
  }, [habilitarEdicion, edicionAutorizada]);

  return {
    puedeEditar,
    requiereNipEdicion,
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    confirmarNipEdicion,
    desbloquearEdicion,
  };
}
