import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
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
import { s } from "./styles";

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
  const ventasSesionActual = (sesionActual?.ventasPorMetodo ?? []).filter(
    (metodo) => Number(metodo.total) > 0,
  );
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
      const res = await Database.getHistorial();
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
    const abierta = historial.some((item) => Number(item.ESTATUS) === 1);
    if (!abierta) return;
    setRefrescando(true);
    try {
      await getData();
    } finally {
      setRefrescando(false);
    }
  };

  const conceptoAperturaValido =
    String(conceptoApertura ?? "").trim().length > 0;

  const abrirCaja = async () => {
    const concepto = String(conceptoApertura ?? "").trim();
    if (!concepto) {
      mostrarAviso(
        "Concepto requerido",
        "Indica el concepto de apertura de caja.",
      );
      return;
    }
    const qrData = await AsyncStorage.getItem("qrCode");
    const nombreDispositivo = await Database.getNombreDispocitivo();
    try {
      const resultado = await Database.insertarApertura({
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
      const resultado = await Database.cerrarCaja(ultimaSesion.ID, fondo);
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
    if (accion === "deposito" || accion === "retiro") {
      setMontoMovimiento("");
      setConceptoMovimiento("");
      setTipoMovimiento(accion);
    }
  };

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
      const resultado = await Database.insertarMovimiento({
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
    ? [gb.green600, gb.green500]
    : ["#C53030", "#E53E3E"];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {/* Header */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
      </LinearGradient>

      <ScrollView
        style={s.historialScroll}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={actualizarCajaAbierta}
            enabled={cajaAbierta}
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
              color={gb.gray50}
            />
            <Text style={s.cajaText}>
              {cajaAbierta ? "CAJA ABIERTA" : "CAJA CERRADA"}
            </Text>
          </View>
          <View style={s.containerCristal}>
            <View style={s.row}>
              <Text style={s.text}>{cajaAbierta ? "En caja:" : "Fondo:"}</Text>
              <Text style={[s.text, { fontSize: normalize(16) }]}>
                {fmtMonto(saldoActual)}
              </Text>
            </View>
            {cajaAbierta && ventasSesionActual.length > 0 && (
              <View style={s.metodosCaja}>
                <Text style={s.metodosTitulo}>Ventas por pago</Text>
                {ventasSesionActual.map((metodo) => (
                  <View key={metodo.nombre} style={s.metodoFila}>
                    <Text style={s.metodoNombre}>{metodo.nombre}</Text>
                    <Text style={s.metodoMonto}>{fmtMonto(metodo.total)}</Text>
                  </View>
                ))}
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
                      color="#C53030"
                    />
                    <Text style={[s.accionTexto, { color: "#C53030" }]}>
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
                  color="#C53030"
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
                          { color: abierta ? gb.green700 : "#C53030" },
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
                                    color: esDeposito ? gb.green700 : "#C53030",
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
                                  color: esDeposito ? gb.green700 : "#C53030",
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
          <Text style={s.conceptoLabel}>Concepto</Text>
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
              style={[
                s.buttonModalAccept,
                !conceptoAperturaValido && { opacity: 0.45 },
              ]}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={abrirCaja}
              disabled={!conceptoAperturaValido}
            >
              <Text
                style={{
                  color: gb.gray50,
                  fontWeight: "bold",
                  fontSize: normalize(12),
                }}
              >
                Confirmar
              </Text>
            </Button>
          </View>
        </View>
      </GeneralModal>

      <GeneralModal
        visible={modalCierre}
        onRequestClose={cerrarModalCierre}
        headerColorGrandien={["#C53030", "#E53E3E"]}
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
                { backgroundColor: "#C53030" },
                !fondoCierreValido && { opacity: 0.45 },
              ]}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={cerrarCaja}
              disabled={!fondoCierreValido}
            >
              <Text
                style={{
                  color: gb.gray50,
                  fontWeight: "bold",
                  fontSize: normalize(12),
                }}
              >
                Confirmar cierre
              </Text>
            </Button>
          </View>
        </View>
      </GeneralModal>

      <GeneralModal
        visible={!!tipoMovimiento}
        onRequestClose={cerrarModalMovimiento}
        headerColorGrandien={
          tipoMovimiento === "retiro"
            ? ["#C53030", "#E53E3E"]
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
                tipoMovimiento === "retiro" && { backgroundColor: "#C53030" },
                !conceptoValido && { opacity: 0.45 },
              ]}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={registrarMovimiento}
              disabled={!conceptoValido}
            >
              <Text
                style={{
                  color: gb.gray50,
                  fontWeight: "bold",
                  fontSize: normalize(12),
                }}
              >
                Confirmar
              </Text>
            </Button>
          </View>
        </View>
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
        message="Se eliminará todo el historial de caja, incluidos depósitos, retiros y ventas ligadas. Esta acción no se puede deshacer."
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
