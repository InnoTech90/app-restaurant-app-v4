import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import Input from "../../../components/atoms/Input/Input";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./dataBase";
import { s } from "./styles";

const Caja = () => {
  const [montoInicial, setMontoInicial] = useState("500");
  const [modalEditar, setModalEditar] = useState(false);
  const [historial, setHistorial] = useState([]);

  const cajaAbierta = historial.length > 0 && historial[0].ESTATUS === 1;

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await Database.getHistorial();
      setHistorial(res || []);
    } catch (error) {
      console.error("Error fetching historial:", error);
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

      {/* Tarjeta principal */}
      <View style={s.cajaWrapper}>
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
              <Text style={s.text}>Monto:</Text>
              <Text style={[s.text, { fontSize: normalize(16) }]}>
                ${historial.length > 0 ? historial[0].MONTO : montoInicial}
              </Text>
            </View>
            <View style={s.containerButtons}>
              {cajaAbierta ? (
                <Button style={s.button} onPress={() => cerrarCaja()}>
                  <Ionicons
                    name="lock-closed"
                    size={normalize(12)}
                    color={gb.gray50}
                  />
                  <Text style={s.text}>Cerrar Caja</Text>
                </Button>
              ) : (
                <Button style={s.button} onPress={() => setModalEditar(true)}>
                  <Ionicons
                    name="lock-open"
                    size={normalize(12)}
                    color={gb.gray50}
                  />
                  <Text style={s.text}>Abrir Caja</Text>
                </Button>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Historial */}
      {historial.length > 0 && (
        <ScrollView
          style={{ flex: 1, backgroundColor: gb.gray50 }}
          contentContainerStyle={s.scroll}
        >
          <View style={s.historialContainer}>
            <Text style={s.historialTitle}>Historial</Text>
            {historial.map((item) => (
              <View key={item.ID} style={s.historialItem}>
                <View
                  style={[
                    s.historialIndicador,
                    {
                      backgroundColor:
                        item.ESTATUS === 1 ? gb.green500 : "#E53E3E",
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.historialFecha}>{item.FECHA}</Text>
                  <Text style={s.historialDevice}>
                    {item.NOMBRE_DISPOCITIVO}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.historialMonto}>${item.MONTO}</Text>
                  <Text
                    style={[
                      s.historialEstatusText,
                      { color: item.ESTATUS === 1 ? gb.green500 : "#E53E3E" },
                    ]}
                  >
                    {item.ESTATUS === 1 ? "Abierta" : "Cerrada"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

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
    </SafeAreaView>
  );
};

export default Caja;
