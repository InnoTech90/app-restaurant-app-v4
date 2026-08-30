import { useCallback, useState } from "react";

export function useEdicionTicket(config) {
  const [edicionAutorizada, setEdicionAutorizada] = useState(false);
  const [modalNipEdicion, setModalNipEdicion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const habilitarEdicion =
    config == null || config.HABILITAR_EDICION_TICKET == null
      ? true
      : !!config.HABILITAR_EDICION_TICKET;

  const puedeEditar = habilitarEdicion || edicionAutorizada;
  const requiereNipEdicion = !habilitarEdicion;

  const solicitarEdicion = useCallback(
    (accion) => {
      if (habilitarEdicion || edicionAutorizada) {
        accion();
        return;
      }
      setAccionPendiente(() => accion);
      setModalNipEdicion(true);
    },
    [habilitarEdicion, edicionAutorizada],
  );

  const confirmarNipEdicion = useCallback(async () => {
    setEdicionAutorizada(true);
    setModalNipEdicion(false);
    if (accionPendiente) {
      accionPendiente();
      setAccionPendiente(null);
    }
  }, [accionPendiente]);

  const cerrarNipEdicion = useCallback(() => {
    setModalNipEdicion(false);
    setAccionPendiente(null);
  }, []);

  const desbloquearEdicion = useCallback(() => {
    if (habilitarEdicion || edicionAutorizada) return;
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
