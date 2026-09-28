import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import Input from "../../../components/atoms/Input/Input";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
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
  const [montoInicial, setMontoInicial] = useState("500");
  const [modalEditar, setModalEditar] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState(null);
  const [montoMovimiento, setMontoMovimiento] = useState("");
  const [nipAccion, setNipAccion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [refrescando, setRefrescando] = useState(false);

  const cajaAbierta = historial.length > 0 && historial[0].ESTATUS === 1;
  const sesionActual = historial[0] ?? null;
  const saldoActual = sesionActual ? sesionActual.SALDO : montoInicial;

  const getData = useCallback(async () => {
    try {
      const res = await Database.getHistorial();
      setHistorial(res || []);
    } catch (error) {
      console.error("Error fetching historial:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [getData]),
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

  const abrirCaja = async () => {
    const qrData = await AsyncStorage.getItem("qrCode");
    const nombreDispositivo = await Database.getNombreDispocitivo();
    try {
      await Database.insertarApertura({
        idSucursal: qrData,
        nombreDispositivo,
        monto: montoInicial,
      });
      setModalEditar(false);
      await getData();
    } catch (error) {
      console.error("Error al abrir caja:", error);
      alert("Error al abrir caja");
    }
  };

  const cerrarCaja = async () => {
    if (!cajaAbierta) return;
    try {
      await Database.cerrarCaja(historial[0].ID);
      await getData();
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      alert("Error al cerrar caja");
    }
  };

  const tituloNip =
    nipAccion === "cerrar"
      ? "Cerrar caja"
      : nipAccion === "retiro"
        ? "Retiro"
        : "Depósito";

  const onNipCorrecto = () => {
    const accion = nipAccion;
    setNipAccion(null);
    if (accion === "cerrar") {
      cerrarCaja();
      return;
    }
    if (accion === "deposito" || accion === "retiro") {
      setMontoMovimiento("");
      setTipoMovimiento(accion);
    }
  };

  const registrarMovimiento = async () => {
    if (!cajaAbierta || !tipoMovimiento) return;
    const cantidad = Number(String(montoMovimiento).replace(",", "."));
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a cero.");
      return;
    }
    if (
      tipoMovimiento === "retiro" &&
      cantidad > Number(saldoActual ?? 0) + 0.001
    ) {
      Alert.alert(
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
      });
      if (resultado && resultado.ok === false) {
        Alert.alert(
          tipoMovimiento === "retiro" ? "Monto insuficiente" : "Depósito",
          resultado.saldo != null
            ? `En caja hay ${fmtMonto(resultado.saldo)}. No puedes retirar ${fmtMonto(cantidad)}.`
            : resultado.message,
        );
        return;
      }
      setTipoMovimiento(null);
      setMontoMovimiento("");
      await getData();
    } catch (error) {
      console.error("Error al registrar movimiento de caja:", error);
      Alert.alert(
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
              <Text style={s.text}>En caja:</Text>
              <Text style={[s.text, { fontSize: normalize(16) }]}>
                {fmtMonto(saldoActual)}
              </Text>
            </View>
            {sesionActual && (sesionActual.ventasPorMetodo ?? []).length > 0 && (
              <View style={s.metodosCaja}>
                <Text style={s.metodosTitulo}>Ventas por pago</Text>
                {sesionActual.ventasPorMetodo.map((metodo) => (
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
            <Text style={s.historialTitle}>Historial</Text>
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
                      <Text style={s.historialFechaLabel}>En caja</Text>
                      <Text style={s.historialMonto}>{fmtMonto(item.SALDO)}</Text>
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
                    </View>
                    {!abierta && (
                      <View style={s.historialFechaBloque}>
                        <Text style={s.historialFechaLabel}>Cierre</Text>
                        <Text style={s.historialFecha}>
                          {item.FECHA_CIERRE
                            ? formatearFechaHoraLocal(item.FECHA_CIERRE)
                            : "—"}
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

      {/* Modal apertura */}
      <GeneralModal
        visible={modalEditar}
        onRequestClose={() => setModalEditar(false)}
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
              onPress={() => setModalEditar(false)}
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
              styleContainer={s.buttonModalAcceptContainer}
              onPress={() => abrirCaja()}
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
        visible={!!tipoMovimiento}
        onRequestClose={() => setTipoMovimiento(null)}
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
              onPress={() => setTipoMovimiento(null)}
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
              ]}
              styleContainer={s.buttonModalAcceptContainer}
              onPress={registrarMovimiento}
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
