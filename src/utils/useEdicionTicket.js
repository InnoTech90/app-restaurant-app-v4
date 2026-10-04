import { useCallback, useEffect, useRef, useState } from "react";

/**
 * HABILITAR_EDICION_TICKET = 1 → edición libre (sin NIP).
 * HABILITAR_EDICION_TICKET = 0 → pide NIP en cada ajuste.
 * Mientras config no carga, no deja pasar cambios libres.
 */
export function useEdicionTicket(config) {
  const [modalNipEdicion, setModalNipEdicion] = useState(false);
  const [notaDesbloqueada, setNotaDesbloqueada] = useState(false);
  const accionPendienteRef = useRef(null);
  const colaSinConfigRef = useRef([]);
  const campoAbierto = useRef(false);

  const configLista = config != null;
  const raw = config?.HABILITAR_EDICION_TICKET;
  const habilitarEdicion = configLista ? Number(raw ?? 1) === 1 : false;

  const puedeEditar = habilitarEdicion;
  const requiereNipEdicion = configLista && !habilitarEdicion;

  const solicitarEdicion = useCallback(
    (accion) => {
      if (!configLista) {
        colaSinConfigRef.current.push(accion);
        return;
      }
      if (habilitarEdicion) {
        accion?.();
        return;
      }
      accionPendienteRef.current = accion;
      setModalNipEdicion(true);
    },
    [configLista, habilitarEdicion],
  );

  useEffect(() => {
    if (!configLista) return;
    const cola = colaSinConfigRef.current;
    colaSinConfigRef.current = [];
    for (const accion of cola) {
      solicitarEdicion(accion);
    }
  }, [configLista, solicitarEdicion]);

  const editarCampo = useCallback(
    (aplicar) => {
      if (!configLista) {
        colaSinConfigRef.current.push(() => {
          campoAbierto.current = true;
          setNotaDesbloqueada(true);
          aplicar?.();
        });
        return;
      }
      if (habilitarEdicion || campoAbierto.current) {
        aplicar?.();
        return;
      }
      solicitarEdicion(() => {
        campoAbierto.current = true;
        setNotaDesbloqueada(true);
        aplicar?.();
      });
    },
    [configLista, habilitarEdicion, solicitarEdicion],
  );

  const enfocarCampo = useCallback(() => {
    if (!configLista) {
      colaSinConfigRef.current.push(() => {
        campoAbierto.current = true;
        setNotaDesbloqueada(true);
      });
      return;
    }
    if (habilitarEdicion) return;
    if (campoAbierto.current) return;
    solicitarEdicion(() => {
      campoAbierto.current = true;
      setNotaDesbloqueada(true);
    });
  }, [configLista, habilitarEdicion, solicitarEdicion]);

  const cerrarCampo = useCallback(() => {
    campoAbierto.current = false;
    setNotaDesbloqueada(false);
  }, []);

  const confirmarNipEdicion = useCallback(() => {
    setModalNipEdicion(false);
    const accion = accionPendienteRef.current;
    accionPendienteRef.current = null;
    accion?.();
  }, []);

  const cerrarNipEdicion = useCallback(() => {
    setModalNipEdicion(false);
    accionPendienteRef.current = null;
  }, []);

  return {
    puedeEditar,
    requiereNipEdicion,
    notaDesbloqueada,
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    editarCampo,
    enfocarCampo,
    cerrarCampo,
    confirmarNipEdicion,
  };
}
