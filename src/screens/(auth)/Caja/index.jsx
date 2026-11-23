import { Ionicons } from "@expo/vector-icons";
import HeaderBar from "../../../components/atoms/HeaderBar/HeaderBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "../../../components/atoms/FondoSolido/FondoSolido";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import Input from "../../../components/atoms/Input/Input";
import ModalWarning from "../../../components/Molecules/ModalWarning/ModalWarning";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { setAuthHeaderTitulo } from "../../../utils/authHeaderTitle";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./dataBase";
import { integracionCaja } from "./integracion";
import { s } from "./styles";

import { color as tema } from "../../../utils/theme";
/** SQLite CURRENT_TIMESTAMP guarda UTC sin zona; convertir a hora local para mostrar. */
const formatearFechaHoraLocal = (fechaStr) => {
  if (!fechaStr) return "—";
  const raw = String(fechaStr).trim();
  const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");
  const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalizada);
  const fecha = new Date(sinZona ? `${normalizada}Z` : normalizada);
  if (Number.isNaN(fecha.getTime())) return raw;

  const pad = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
};

const fmtMonto = (valor) => `$${Number(valor ?? 0).toFixed(2)}`;

const Caja = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const idMesaRetorno = Array.isArray(params.id_mesa)
    ? params.id_mesa[0]
    : params.id_mesa;
  const abrir = Array.isArray(params.abrir) ? params.abrir[0] : params.abrir;
  const vieneDePago = returnTo === "Pago" && !!idMesaRetorno;
  const abrirAlEntrar = abrir === "1";
  const modalAperturaSolicitadoRef = useRef(false);

  const [montoInicial, setMontoInicial] = useState("500");
  const [conceptoApertura, setConceptoApertura] = useState("");
  const [modalEditar, setModalEditar] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);
  const [fondoCierre, setFondoCierre] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState(null);
  const [montoMovimiento, setMontoMovimiento] = useState("");
  const [conceptoMovimiento, setConceptoMovimiento] = useState("");
  const [nipAccion, setNipAccion] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [openConfirmEliminarHistorial, setOpenConfirmEliminarHistorial] =
    useState(false);
  const [historial, setHistorial] = useState([]);
  const [corteEnEdicion, setCorteEnEdicion] = useState(null);
  const [formCorte, setFormCorte] = useState(null);
  const [guardandoCorte, setGuardandoCorte] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  const ultimaSesion = historial[0] ?? null;
  const cajaAbierta = !!ultimaSesion && Number(ultimaSesion.ESTATUS) === 1;
  const sesionActual = cajaAbierta ? ultimaSesion : null;
  const fondoCerrado =
    !cajaAbierta && ultimaSesion != null
      ? Number(ultimaSesion.FONDO ?? 0)
      : null;
  const saldoActual = sesionActual
    ? sesionActual.SALDO
    : Number.isFinite(fondoCerrado)
      ? fondoCerrado
      : 0;
  const movimientosCaja = sesionActual?.movimientosEfectivo ?? [];
  const fondoCierreValido = (() => {
    const valor = Number(String(fondoCierre).replace(",", "."));
    return Number.isFinite(valor) && valor >= 0 && String(fondoCierre).trim() !== "";
  })();

  const regresarAPago = useCallback(() => {
    setAuthHeaderTitulo("Pagar");
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: "/Pago",
      params: { id_mesa: String(idMesaRetorno) },
    });
  }, [idMesaRetorno, router]);

  const getData = useCallback(async () => {
    try {
      const res = await integracionCaja.getHistorial();
      setHistorial(res || []);
      return res || [];
    } catch (error) {
      console.error("Error fetching historial:", error);
      return [];
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      modalAperturaSolicitadoRef.current = false;

      (async () => {
        const res = await getData();
        if (!activo) return;

        const abierta = !!res[0] && Number(res[0].ESTATUS) === 1;

        if (vieneDePago && abrirAlEntrar && abierta) {
          regresarAPago();
          return;
        }

        if (
          abrirAlEntrar &&
          !abierta &&
          !modalAperturaSolicitadoRef.current
        ) {
          modalAperturaSolicitadoRef.current = true;
          setModalEditar(true);
        }
      })();

      return () => {
        activo = false;
      };
    }, [abrirAlEntrar, getData, regresarAPago, vieneDePago]),
  );

  const actualizarCajaAbierta = async () => {
    setRefrescando(true);
    try {
      await getData();
    } finally {
      setRefrescando(false);
    }
  };

  // El concepto es opcional: sin texto se guarda uno por defecto (el
  // servidor y la base local lo piden no vacío).
  const CONCEPTO_APERTURA_DEFAULT = "Apertura de caja";

  const abrirCaja = async () => {
    const concepto =
      String(conceptoApertura ?? "").trim() || CONCEPTO_APERTURA_DEFAULT;
    const qrData = await AsyncStorage.getItem("qrCode");
    const nombreDispositivo = await Database.getNombreDispocitivo();
    try {
      const resultado = await integracionCaja.abrirCaja({
        idSucursal: qrData,
        nombreDispositivo,
        monto: montoInicial,
        concepto,
      });
      if (resultado && resultado.ok === false) {
        mostrarAviso(
          "No se pudo abrir",
          resultado.message || "Intenta de nuevo.",
        );
        return;
      }
      setModalEditar(false);
      setConceptoApertura("");
      await getData();
      if (vieneDePago) {
        regresarAPago();
      }
    } catch (error) {
      console.error("Error al abrir caja:", error);
      mostrarAviso("No se pudo abrir", "Error al abrir caja.");
    }
  };

  const cerrarModalCierre = () => {
    setModalCierre(false);
    setFondoCierre("");
  };

  const cerrarCaja = async () => {
    if (!cajaAbierta || !ultimaSesion) return;
    const fondo = Number(String(fondoCierre).replace(",", "."));
    if (!Number.isFinite(fondo) || fondo < 0 || String(fondoCierre).trim() === "") {
      mostrarAviso("Fondo inválido", "Ingresa el fondo que deja en caja.");
      return;
    }
    try {
      const resultado = await integracionCaja.cerrarCaja(ultimaSesion.ID, fondo);
      if (resultado && resultado.ok === false) {
        mostrarAviso(
          "No se pudo cerrar",
          resultado.message || "Intenta de nuevo.",
        );
        return;
      }
      cerrarModalCierre();
      await getData();
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      mostrarAviso("No se pudo cerrar", "Error al cerrar caja.");
    }
  };

  const tituloNip =
    nipAccion === "cerrar"
      ? "Cerrar caja"
      : nipAccion === "retiro"
        ? "Retiro"
        : nipAccion === "eliminarHistorial"
          ? "Eliminar historial"
          : nipAccion === "editarCorte"
            ? "Editar corte"
            : "Depósito";

  const eliminarHistorial = async () => {
    try {
      const resultado = await Database.eliminarHistorial();
      if (resultado && resultado.ok === false) {
        mostrarAviso(
          "No se pudo eliminar",
          resultado.message || "Intenta de nuevo.",
        );
        return;
      }
      await getData();
      mostrarAviso(
        resultado?.eliminados ? "Historial limpio" : "Nada que limpiar",
        resultado?.eliminados
          ? `Se quitaron ${resultado.eliminados} ${resultado.eliminados === 1 ? "corte" : "cortes"} de esta tablet. Siguen guardados en el panel web.`
          : "Solo se limpian cortes cerrados y ya sincronizados. La caja abierta no se toca.",
        resultado?.eliminados ? "info" : "warning",
      );
    } catch (error) {
      console.error("Error al eliminar historial de caja:", error);
      mostrarAviso(
        "No se pudo eliminar",
        "Ocurrió un problema al eliminar el historial. Intenta de nuevo.",
      );
    }
  };

  const onNipCorrecto = () => {
    const accion = nipAccion;
    setNipAccion(null);
    if (accion === "cerrar") {
      const saldo = Number(sesionActual?.SALDO ?? 0);
      setFondoCierre(Number.isFinite(saldo) ? String(saldo.toFixed(2)) : "0");
      setModalCierre(true);
      return;
    }
    if (accion === "eliminarHistorial") {
      eliminarHistorial();
      return;
    }
    if (accion === "editarCorte" && corteEnEdicion) {
      const c = corteEnEdicion;
      setFormCorte({
        monto: String(Number(c.MONTO ?? 0)),
        concepto: String(c.CONCEPTO ?? ""),
        fondo: c.FONDO == null ? "" : String(Number(c.FONDO)),
        movimientos: (c.movimientos ?? []).map((m) => ({
          id: m.ID,
          uuid: m.UUID ?? null,
          tipo: m.TIPO,
          monto: String(Number(m.MONTO ?? 0)),
          concepto: String(m.CONCEPTO ?? ""),
        })),
      });
      return;
    }
    if (accion === "deposito" || accion === "retiro") {
      setMontoMovimiento("");
      setConceptoMovimiento("");
      setTipoMovimiento(accion);
    }
  };

  const pedirEditarCorte = (item) => {
    setCorteEnEdicion(item);
    setNipAccion("editarCorte");
  };

  const cerrarEditarCorte = () => {
    if (guardandoCorte) return;
    setFormCorte(null);
    setCorteEnEdicion(null);
  };

  const aNumero = (v) => Number(String(v ?? "").replace(",", "."));

  const guardarCorte = async () => {
    const c = corteEnEdicion;
    if (!c || !formCorte) return;
    const monto = aNumero(formCorte.monto);
    if (!Number.isFinite(monto) || monto < 0 || !String(formCorte.monto).trim()) {
      mostrarAviso("Monto inválido", "El monto de apertura no puede ser negativo.");
      return;
    }
    const cerrada = Number(c.ESTATUS) === 0;
    const fondo = aNumero(formCorte.fondo);
    if (cerrada && (!Number.isFinite(fondo) || fondo < 0 || !String(formCorte.fondo).trim())) {
      mostrarAviso("Fondo inválido", "Ingresa el fondo que quedó en caja.");
      return;
    }
    const cambios = {};
    if (monto !== Number(c.MONTO ?? 0)) cambios.monto = monto;
    const concepto = String(formCorte.concepto ?? "").trim() || CONCEPTO_APERTURA_DEFAULT;
    if (concepto !== String(c.CONCEPTO ?? "").trim()) cambios.concepto = concepto;
    if (cerrada && fondo !== Number(c.FONDO ?? 0)) cambios.fondo = fondo;

    const movimientos = [];
    for (const m of formCorte.movimientos) {
      const original = (c.movimientos ?? []).find((o) => o.ID === m.id);
      const montoMov = aNumero(m.monto);
      const conceptoMov = String(m.concepto ?? "").trim();
      if (!Number.isFinite(montoMov) || montoMov <= 0) {
        mostrarAviso("Monto inválido", "Cada depósito o retiro debe ser mayor a cero.");
        return;
      }
      if (!conceptoMov) {
        mostrarAviso("Falta concepto", "Cada depósito o retiro necesita un concepto.");
        return;
      }
      const cambio = { id: m.id, uuid: m.uuid };
      if (montoMov !== Number(original?.MONTO ?? 0)) cambio.monto = montoMov;
      if (conceptoMov !== String(original?.CONCEPTO ?? "").trim()) cambio.concepto = conceptoMov;
      if (cambio.monto !== undefined || cambio.concepto !== undefined) movimientos.push(cambio);
    }
    if (movimientos.length) cambios.movimientos = movimientos;

    if (!Object.keys(cambios).length) {
      setFormCorte(null);
      setCorteEnEdicion(null);
      return;
    }

    setGuardandoCorte(true);
    try {
      const res = await integracionCaja.editarCorte(c, cambios);
      if (res && res.ok === false) {
        mostrarAviso("No se pudo editar", res.message || "Intenta de nuevo.");
        return;
      }
      setFormCorte(null);
      setCorteEnEdicion(null);
      await getData();
      mostrarAviso("Corte actualizado", "Los cambios se guardaron.", "info");
    } catch (error) {
      console.error("Error al editar corte:", error);
      mostrarAviso("No se pudo editar", "Ocurrió un problema. Intenta de nuevo.");
    } finally {
      setGuardandoCorte(false);
    }
  };

  const actualizarMovForm = (id, campo, valor) =>
    setFormCorte((f) => ({
      ...f,
      movimientos: f.movimientos.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)),
    }));

  const cerrarModalMovimiento = () => {
    setTipoMovimiento(null);
    setMontoMovimiento("");
    setConceptoMovimiento("");
  };

  const conceptoValido = String(conceptoMovimiento ?? "").trim().length > 0;

  const mostrarAviso = (title, message, type = "warning") => {
    setAviso({ title, message, type });
  };

  const cerrarModalApertura = () => {
    setModalEditar(false);
    setConceptoApertura("");
  };

  const registrarMovimiento = async () => {
    if (!cajaAbierta || !tipoMovimiento || !conceptoValido) return;
    const cantidad = Number(String(montoMovimiento).replace(",", "."));
    const concepto = String(conceptoMovimiento ?? "").trim();
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      mostrarAviso("Monto inválido", "Ingresa un monto mayor a cero.");
      return;
    }
    if (
      tipoMovimiento === "retiro" &&
      cantidad > Number(saldoActual ?? 0) + 0.001
    ) {
      mostrarAviso(
        "Monto insuficiente",
        `En caja hay ${fmtMonto(saldoActual)}. No puedes retirar ${fmtMonto(cantidad)}.`,
      );
      return;
    }
    try {
      const resultado = await integracionCaja.registrarMovimiento({
        idCaja: sesionActual.ID,
        tipo: tipoMovimiento,
        monto: cantidad,
        concepto,
      });
      if (resultado && resultado.ok === false) {
        mostrarAviso(
          tipoMovimiento === "retiro" ? "Monto insuficiente" : "Depósito",
          resultado.saldo != null
            ? `En caja hay ${fmtMonto(resultado.saldo)}. No puedes retirar ${fmtMonto(cantidad)}.`
            : resultado.message,
        );
        return;
      }
      cerrarModalMovimiento();
      await getData();
    } catch (error) {
      console.error("Error al registrar movimiento de caja:", error);
      mostrarAviso(
        "No se pudo guardar",
        "Ocurrió un problema al registrar el movimiento. Intenta de nuevo.",
      );
    }
  };

  const coloresCaja = cajaAbierta
    ? [tema.surface, tema.surface]
    : [tema.surface, tema.surface];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: gb.gray100 }}
    >
      {/* Header */}
      <HeaderBar style={s.header}>
        <RecoverButton />
      </HeaderBar>

      <ScrollView
        style={s.historialScroll}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={actualizarCajaAbierta}
            enabled
            colors={gb.gradient_blue}
            tintColor={gb.blue550}
          />
        }
      >
      {/* Tarjeta principal */}
      <View style={[s.cajaWrapper, s.cajaWrapperEnScroll]}>
        <LinearGradient
          style={s.caja}
          colors={coloresCaja}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={s.cajaTitle}>
            <Ionicons
              name={cajaAbierta ? "checkmark-circle" : "close-circle"}
              size={normalize(22)}
              color={cajaAbierta ? "#18A058" : "#8A93B2"}
            />
            <Text style={s.cajaText}>
              {cajaAbierta ? "Caja abierta" : "Caja cerrada"}
            </Text>
          </View>
          <View style={s.containerCristal}>
            <View style={s.row}>
              <Text style={s.text}>{cajaAbierta ? "En caja:" : "Fondo:"}</Text>
              <Text style={[s.text, { fontSize: normalize(16) }]}>
                {fmtMonto(saldoActual)}
              </Text>
            </View>
            {/* Solo dinero físico: apertura, pagos en efectivo, depósitos
                y retiros. Tarjeta, transferencia, etc. no entran. */}
            {cajaAbierta && movimientosCaja.length > 0 && (
              <View style={s.metodosCaja}>
                <Text style={s.metodosTitulo}>Movimientos</Text>
                {movimientosCaja.map((mov) => {
                  const esRetiro = mov.tipo === "retiro";
                  return (
                    <View key={mov.clave} style={s.metodoFila}>
                      <Text style={s.metodoNombre} numberOfLines={1}>
                        {mov.tipo === "apertura"
                          ? "Apertura"
                          : mov.tipo === "ventas"
                            ? "Pagos en efectivo"
                            : `${esRetiro ? "Retiro" : "Depósito"}${mov.concepto ? ` · ${mov.concepto}` : ""}`}
                      </Text>
                      <Text style={[s.metodoMonto, esRetiro && s.montoRetiro]}>
                        {esRetiro ? "-" : ""}
                        {fmtMonto(mov.monto)}
                      </Text>
                    </View>
                  );
                })}
                <View style={[s.metodoFila, s.movTotalFila]}>
                  <Text style={s.movTotalTexto}>Total en caja</Text>
                  <Text style={s.movTotalTexto}>{fmtMonto(saldoActual)}</Text>
                </View>
              </View>
            )}
            <View style={s.containerButtons}>
              {cajaAbierta ? (
                <>
                  <Pressable
                    style={({ pressed }) => [
                      s.accionBtn,
                      s.accionDeposito,
                      pressed && s.accionPressed,
                    ]}
                    onPress={() => setNipAccion("deposito")}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={normalize(18)}
                      color={gb.green700}
                    />
                    <Text style={[s.accionTexto, { color: gb.green700 }]}>
                      Depósito
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      s.accionBtn,
                      s.accionRetiro,
                      pressed && s.accionPressed,
                    ]}
                    onPress={() => setNipAccion("retiro")}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={normalize(18)}
                      color="#E5484D"
                    />
                    <Text style={[s.accionTexto, { color: "#E5484D" }]}>
                      Retiro
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      s.accionBtn,
                      s.accionCerrar,
                      pressed && s.accionPressed,
                    ]}
                    onPress={() => setNipAccion("cerrar")}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={normalize(18)}
                      color={gb.gray700}
                    />
                    <Text style={[s.accionTexto, { color: gb.gray700 }]}>
                      Cerrar
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    s.accionBtn,
                    s.accionAbrir,
                    pressed && s.accionPressed,
                  ]}
                  onPress={() => setModalEditar(true)}
                >
                  <Ionicons
                    name="lock-open-outline"
                    size={normalize(18)}
                    color="white"
                  />
                  <Text style={[s.accionTexto, { color: "white" }]}>
                    Abrir caja
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Historial */}
        {historial.length > 0 ? (
          <View style={s.historialContainer}>
            <View style={s.historialHeader}>
              <Text style={s.historialTitle}>Historial</Text>
              <Pressable
                style={({ pressed }) => [
                  s.historialEliminarBtn,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setOpenConfirmEliminarHistorial(true)}
              >
                <Ionicons
                  name="trash-outline"
                  size={normalize(14)}
                  color="#E5484D"
                />
                <Text style={s.historialEliminarTexto}>Eliminar</Text>
              </Pressable>
            </View>
            {historial.map((item) => {
              const abierta = Number(item.ESTATUS) === 1;
              const ventas = (item.ventasPorMetodo ?? []).filter(
                (metodo) => Number(metodo.total) > 0,
              );
              return (
                <View key={item.ID} style={s.historialItem}>
                  <View style={s.historialEncabezado}>
                    <View style={{ flex: 1, gap: normalize(4) }}>
                      <Text
                        style={[
                          s.historialEstatusText,
                          { color: abierta ? gb.green700 : "#E5484D" },
                        ]}
                      >
                        {abierta ? "Abierta" : "Cerrada"}
                      </Text>
                      {!!item.NOMBRE_DISPOCITIVO && (
                        <Text style={s.historialDevice} numberOfLines={2}>
                          {item.NOMBRE_DISPOCITIVO}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.historialFechaLabel}>
                        {abierta ? "En caja" : "Fondo"}
                      </Text>
                      <Text style={s.historialMonto}>
                        {fmtMonto(abierta ? item.SALDO : item.FONDO)}
                      </Text>
                    </View>
                  </View>

                  <View style={s.historialFechas}>
                    <View style={s.historialFechaBloque}>
                      <Text style={s.historialFechaLabel}>Apertura</Text>
                      <Text style={s.historialFecha}>
                        {formatearFechaHoraLocal(item.FECHA)}
                      </Text>
                      <Text style={s.historialApertura}>
                        {fmtMonto(item.MONTO)}
                      </Text>
                      {!!String(item.CONCEPTO ?? "").trim() && (
                        <Text style={s.movimientoConcepto} numberOfLines={3}>
                          {String(item.CONCEPTO).trim()}
                        </Text>
                      )}
                    </View>
                    {!abierta && (
                      <View style={s.historialFechaBloque}>
                        <Text style={s.historialFechaLabel}>Cierre</Text>
                        <Text style={s.historialFecha}>
                          {item.FECHA_CIERRE
                            ? formatearFechaHoraLocal(item.FECHA_CIERRE)
                            : "—"}
                        </Text>
                        <Text style={s.historialApertura}>
                          Fondo {fmtMonto(item.FONDO)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {ventas.length > 0 && (
                    <View style={s.historialSeccion}>
                      <Text style={s.historialSeccionTitulo}>Ventas</Text>
                      {ventas.map((metodo) => (
                        <View key={metodo.nombre} style={s.historialLinea}>
                          <Text style={s.historialLineaNombre}>
                            {metodo.nombre}
                          </Text>
                          <Text style={s.historialLineaMonto}>
                            {fmtMonto(metodo.total)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {(item.movimientos ?? []).length > 0 && (
                    <View style={s.historialSeccion}>
                      <Text style={s.historialSeccionTitulo}>Movimientos</Text>
                      {item.movimientos.map((mov) => {
                        const esDeposito = mov.TIPO === "deposito";
                        return (
                          <View key={mov.ID} style={s.historialLinea}>
                            <View style={{ flex: 1, gap: normalize(2) }}>
                              <Text
                                style={[
                                  s.movimientoTipo,
                                  {
                                    color: esDeposito ? gb.green700 : "#E5484D",
                                  },
                                ]}
                              >
                                {esDeposito ? "Depósito" : "Retiro"}
                              </Text>
                              <Text style={s.movimientoFecha}>
                                {formatearFechaHoraLocal(mov.FECHA)}
                              </Text>
                              {!!mov.CONCEPTO?.trim() && (
                                <Text style={s.movimientoConcepto}>
                                  {mov.CONCEPTO}
                                </Text>
                              )}
                            </View>
                            <Text
                              style={[
                                s.movimientoMonto,
                                {
                                  color: esDeposito ? gb.green700 : "#E5484D",
                                },
                              ]}
                            >
                              {esDeposito ? "+" : "−"}
                              {fmtMonto(mov.MONTO)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  <Pressable
                    style={({ pressed }) => [
                      s.historialEditarBtn,
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => pedirEditarCorte(item)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={normalize(14)}
                      color={gb.purple550}
                    />
                    <Text style={s.historialEditarTexto}>Editar</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={s.historialVacio}>
            <Ionicons
              name="receipt-outline"
              size={normalize(42)}
              color={gb.gray300}
            />
            <Text style={s.historialVacioTexto}>
              Aún no hay movimientos de caja.
            </Text>
          </View>
        )}
      </ScrollView>

      <GeneralModal
        visible={modalEditar}
        onRequestClose={cerrarModalApertura}
        headerColorGrandien={gb.gradient_blue}
        iconCloseColor={gb.gray50}
        headerColorText={gb.gray50}
        headerTitle={"Apertura de caja"}
      >
        <View style={s.contenidoModal}>
          <Text style={s.modalDescripcion}>
            Ingrese el monto inicial con el que abre la caja
          </Text>
          <Input
            placeholder="Monto inicial"
            keyboardType="numeric"
            value={montoInicial}
            onChange={(text) => setMontoInicial(text)}
            styleInput={s.input}
            icon={"cash-outline"}
            iconColor={gb.purple550}
          />
          <Text
            style={{
              color: gb.gray400,
              fontWeight: "bold",
              marginTop: normalize(10),
            }}
          >
            Montos rápidos
          </Text>
          <View style={s.montosRapidosContainer}>
            {["100", "200", "500", "1000"].map((monto) => (
              <Pressable
                key={monto}
                style={s.montoRapido}
                onPress={() => setMontoInicial(monto)}
              >
                <Text style={{ color: gb.purple550 }}>${monto}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.conceptoLabel}>Concepto (opcional)</Text>
          <TextInput
            style={s.conceptoInput}
            value={conceptoApertura}
            onChangeText={setConceptoApertura}
            placeholder="Escribe el motivo de la apertura..."
            placeholderTextColor={gb.gray400}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View
            style={{
              flexDirection: "row",
              gap: normalize(20),
              marginTop: normalize(20),
            }}
          >
            <Button
              style={s.buttonModalCancel}
              styleContainer={s.buttonModalCancelContainer}
              onPress={cerrarModalApertura}
            >
              <Text
                style={{
                  color: gb.gray500,
                  fontWeight: "bold",
                  fontSize: normalize(12),
                }}
              >
                Cancelar
              </Text>
            </Button>
            <Button
              style={s.buttonModalAccept}
              disabledStyle={s.botonBloqueado}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={abrirCaja}
            >
              <View style={s.botonContenido}>
                <Text style={s.botonTexto}>Confirmar</Text>
              </View>
            </Button>
          </View>
        </View>
      </GeneralModal>

      <GeneralModal
        visible={modalCierre}
        onRequestClose={cerrarModalCierre}
        headerColorGrandien={["#E5484D", "#E5484D"]}
        iconCloseColor={gb.gray50}
        headerColorText={gb.gray50}
        headerTitle={"Cierre de caja"}
      >
        <View style={s.contenidoModal}>
          <Text style={s.modalDescripcion}>
            Ingrese el fondo que deja en caja
          </Text>
          <Input
            placeholder="Fondo"
            keyboardType="numeric"
            value={fondoCierre}
            onChange={(text) => setFondoCierre(text)}
            styleInput={s.input}
            icon={"cash-outline"}
            iconColor={gb.purple550}
          />
          <Text
            style={{
              color: gb.gray400,
              fontWeight: "bold",
              marginTop: normalize(10),
            }}
          >
            Montos rápidos
          </Text>
          <View style={s.montosRapidosContainer}>
            {["0", "100", "200", "500", "1000"].map((monto) => (
              <Pressable
                key={monto}
                style={s.montoRapido}
                onPress={() => setFondoCierre(monto)}
              >
                <Text style={{ color: gb.purple550 }}>${monto}</Text>
              </Pressable>
            ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: normalize(20),
              marginTop: normalize(20),
            }}
          >
            <Button
              style={s.buttonModalCancel}
              styleContainer={s.buttonModalCancelContainer}
              onPress={cerrarModalCierre}
            >
              <Text
                style={{
                  color: gb.gray500,
                  fontWeight: "bold",
                  fontSize: normalize(12),
                }}
              >
                Cancelar
              </Text>
            </Button>
            <Button
              style={[
                s.buttonModalAccept,
                { backgroundColor: "#E5484D" },
              ]}
              disabledStyle={s.botonBloqueado}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={cerrarCaja}
              disabled={!fondoCierreValido}
            >
              <View style={s.botonContenido}>
                {!fondoCierreValido ? (
                  <Ionicons name="lock-closed-outline" size={normalize(13)} color={tema.textMuted} />
                ) : null}
                <Text
                  style={[
                    s.botonTexto,
                    !fondoCierreValido && s.botonTextoBloqueado,
                  ]}
                >
                  Confirmar cierre
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </GeneralModal>

      <GeneralModal
        visible={!!tipoMovimiento}
        onRequestClose={cerrarModalMovimiento}
        headerColorGrandien={
          tipoMovimiento === "retiro"
            ? ["#E5484D", "#E5484D"]
            : [gb.green700, gb.green500]
        }
        iconCloseColor={gb.gray50}
        headerColorText={gb.gray50}
        headerTitle={tipoMovimiento === "retiro" ? "Retiro" : "Depósito"}
      >
        <View style={s.contenidoModal}>
          <Text style={s.modalDescripcion}>
            {tipoMovimiento === "retiro"
              ? "El monto se resta de la caja abierta."
              : "El monto se suma a la caja abierta."}
          </Text>
          <Input
            placeholder="Monto"
            keyboardType="numeric"
            value={montoMovimiento}
            onChange={setMontoMovimiento}
            styleInput={s.input}
            icon="cash-outline"
            iconColor={gb.purple550}
          />
          <Text
            style={{
              color: gb.gray400,
              fontWeight: "bold",
              marginTop: normalize(10),
            }}
          >
            Montos rápidos
          </Text>
          <View style={s.montosRapidosContainer}>
            {["100", "200", "500", "1000"].map((monto) => (
              <Pressable
                key={monto}
                style={s.montoRapido}
                onPress={() => setMontoMovimiento(monto)}
              >
                <Text style={{ color: gb.purple550 }}>${monto}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.conceptoLabel}>Concepto</Text>
          <TextInput
            style={s.conceptoInput}
            value={conceptoMovimiento}
            onChangeText={setConceptoMovimiento}
            placeholder="Escribe el motivo del movimiento..."
            placeholderTextColor={gb.gray400}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View
            style={{
              flexDirection: "row",
              gap: normalize(20),
              marginTop: normalize(20),
            }}
          >
            <Button
              style={s.buttonModalCancel}
              styleContainer={s.buttonModalCancelContainer}
              onPress={cerrarModalMovimiento}
            >
              <Text
                style={{
                  color: gb.gray500,
                  fontWeight: "bold",
                  fontSize: normalize(12),
                }}
              >
                Cancelar
              </Text>
            </Button>
            <Button
              style={[
                s.buttonModalAccept,
                tipoMovimiento === "retiro" && { backgroundColor: "#E5484D" },
              ]}
              disabledStyle={s.botonBloqueado}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={registrarMovimiento}
              disabled={!conceptoValido}
            >
              <View style={s.botonContenido}>
                {!conceptoValido ? (
                  <Ionicons name="lock-closed-outline" size={normalize(13)} color={tema.textMuted} />
                ) : null}
                <Text
                  style={[
                    s.botonTexto,
                    !conceptoValido && s.botonTextoBloqueado,
                  ]}
                >
                  Confirmar
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </GeneralModal>

      <GeneralModal
        visible={!!formCorte}
        onRequestClose={cerrarEditarCorte}
        headerColorGrandien={gb.gradient_blue}
        iconCloseColor={gb.gray50}
        headerColorText={gb.gray50}
        headerTitle={"Editar corte"}
      >
        {!!formCorte && (
          <ScrollView
            style={{ maxHeight: normalize(460) }}
            contentContainerStyle={s.contenidoModal}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.modalDescripcion}>
              Corrige los montos y conceptos de este corte.
            </Text>
            <Text style={s.editarSeccionTitulo}>Apertura</Text>
            <View style={s.editarFila}>
              <TextInput
                style={s.editarMonto}
                value={formCorte.monto}
                onChangeText={(v) => setFormCorte((f) => ({ ...f, monto: v }))}
                keyboardType="numeric"
                placeholder="Monto"
                placeholderTextColor={gb.gray400}
              />
              <TextInput
                style={s.editarConcepto}
                value={formCorte.concepto}
                onChangeText={(v) => setFormCorte((f) => ({ ...f, concepto: v }))}
                placeholder="Concepto (opcional)"
                placeholderTextColor={gb.gray400}
              />
            </View>

            {Number(corteEnEdicion?.ESTATUS) === 0 && (
              <View style={s.editarSeccion}>
                <Text style={s.editarSeccionTitulo}>Fondo al cerrar</Text>
                <TextInput
                  style={s.editarMonto}
                  value={formCorte.fondo}
                  onChangeText={(v) => setFormCorte((f) => ({ ...f, fondo: v }))}
                  keyboardType="numeric"
                  placeholder="Fondo"
                  placeholderTextColor={gb.gray400}
                />
              </View>
            )}

            {formCorte.movimientos.length > 0 && (
              <View style={s.editarSeccion}>
                <Text style={s.editarSeccionTitulo}>Depósitos y retiros</Text>
                {formCorte.movimientos.map((m) => {
                  const esDeposito = m.tipo === "deposito";
                  return (
                    <View key={m.id} style={{ gap: normalize(4) }}>
                      <Text
                        style={[
                          s.movimientoTipo,
                          { color: esDeposito ? gb.green700 : "#E5484D" },
                        ]}
                      >
                        {esDeposito ? "Depósito" : "Retiro"}
                      </Text>
                      <View style={s.editarFila}>
                        <TextInput
                          style={s.editarMonto}
                          value={m.monto}
                          onChangeText={(v) => actualizarMovForm(m.id, "monto", v)}
                          keyboardType="numeric"
                          placeholder="Monto"
                          placeholderTextColor={gb.gray400}
                        />
                        <TextInput
                          style={s.editarConcepto}
                          value={m.concepto}
                          onChangeText={(v) => actualizarMovForm(m.id, "concepto", v)}
                          placeholder="Concepto"
                          placeholderTextColor={gb.gray400}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                gap: normalize(20),
                marginTop: normalize(20),
              }}
            >
              <Button
                style={s.buttonModalCancel}
                styleContainer={s.buttonModalCancelContainer}
                onPress={cerrarEditarCorte}
              >
                <Text
                  style={{
                    color: gb.gray500,
                    fontWeight: "bold",
                    fontSize: normalize(12),
                  }}
                >
                  Cancelar
                </Text>
              </Button>
              <Button
                style={s.buttonModalAccept}
                disabledStyle={s.botonBloqueado}
                styleContainer={s.buttonModalAcceptContainer}
                onPress={guardarCorte}
                disabled={guardandoCorte}
              >
                <View style={s.botonContenido}>
                  <Text style={s.botonTexto}>
                    {guardandoCorte ? "Guardando..." : "Guardar"}
                  </Text>
                </View>
              </Button>
            </View>
          </ScrollView>
        )}
      </GeneralModal>

      <ModalWarning
        visible={!!aviso}
        type={aviso?.type ?? "warning"}
        title={aviso?.title ?? ""}
        message={aviso?.message ?? ""}
        confirmText="Entendido"
        cancelText="Cerrar"
        onCancel={() => setAviso(null)}
        onConfirm={() => setAviso(null)}
      />

      <ModalWarning
        visible={openConfirmEliminarHistorial && nipAccion !== "eliminarHistorial"}
        type="danger"
        title="Eliminar historial"
        message="Se quitarán de esta tablet los cortes de caja cerrados y ya sincronizados. Siguen guardados en el panel web. La caja abierta y lo pendiente de subir no se tocan."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setOpenConfirmEliminarHistorial(false)}
        onConfirm={() => {
          setOpenConfirmEliminarHistorial(false);
          setNipAccion("eliminarHistorial");
        }}
      />

      <NipModal
        visible={!!nipAccion}
        titulo={tituloNip}
        modo="acceso"
        keywords={["cash"]}
        onClose={() => setNipAccion(null)}
        onSubmit={onNipCorrecto}
      />
    </SafeAreaView>
  );
};

export default Caja;
