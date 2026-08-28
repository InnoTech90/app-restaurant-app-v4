import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";

const fmtStock = (val) =>
  val !== null && val !== undefined ? String(parseFloat(val)) : "0";

const AJUSTES = [
  { valor: 1, label: "1" },
  { valor: 5, label: "5" },
  { valor: 10, label: "10" },
];

/**
 * Modal para ajustar el stock de una materia prima.
 * @param {object}   seleccionado  - Item activo (null = cerrado)
 * @param {function} onClose       - Cierra el modal
 * @param {function} onGuardar     - async (uuid, nuevoStock) => void
 */
const ModalAjustarInventario = ({ seleccionado, onClose, onGuardar }) => {
  const [cantidad, setCantidad] = useState("1");
  const [tipoMovimiento, setTipoMovimiento] = useState("entrada");
  const [guardando, setGuardando] = useState(false);

  console.log("ModalAjustarInventario renderizado con seleccionado:", seleccionado);

  useEffect(() => {
    if (seleccionado) {
      setCantidad("1");
      setTipoMovimiento("entrada");
    }
  }, [seleccionado]);

  const aplicarAjuste = (cantidadRapida) => setCantidad(String(cantidadRapida));

  const cantidadMovimiento = parseFloat(cantidad) || 0;
  const stockActual = Number(seleccionado?.STOCK_ACTUAL) || 0;
  const nuevoStock =
    tipoMovimiento === "entrada"
      ? stockActual + cantidadMovimiento
      : Math.max(0, stockActual - cantidadMovimiento);

  const guardar = async () => {
    try {
      if (!Number.isFinite(cantidadMovimiento) || cantidadMovimiento <= 0) {
        Alert.alert("Cantidad inválida", "Ingresa una cantidad mayor a cero.");
        return;
      }

      if (tipoMovimiento === "salida" && cantidadMovimiento > stockActual) {
        Alert.alert(
          "Stock insuficiente",
          "La salida no puede superar el stock disponible.",
        );
        return;
      }

      setGuardando(true);
      await onGuardar(seleccionado.UUID_SUCURSAL, nuevoStock);
      onClose();
    } catch (e) {
      console.error("Error guardando stock:", e);
      Alert.alert("No se pudo guardar", String(e?.message ?? e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <GeneralModal
      visible={!!seleccionado}
      onRequestClose={onClose}
      headerTitle="Ajustar inventario"
      headerColorGrandien={gb.gradient_blue}
      iconCloseColor="white"
      headerColorText="white"
      animationType="slide"
    >
      {seleccionado && (
        <View style={s.modalInner}>
          {/* Nombre */}
          <Text style={s.modalNombre}>{seleccionado.NOMBRE}</Text>
          <Text style={s.uuid} selectable>
            UUID: {seleccionado.UUID}
          </Text>

          {/* Fila de info */}
          <View style={s.infoRow}>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Stock actual</Text>
              <Text style={s.infoValue}>
                {fmtStock(seleccionado.STOCK_ACTUAL)}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Stock mínimo</Text>
              <Text style={s.infoValue}>
                {fmtStock(seleccionado.STOCK_MINIMO)}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Unidad</Text>
              <Text style={s.infoValueUnidad}>
                {seleccionado.UNIDAD_ABREVIACION ??
                  seleccionado.UNIDAD_NOMBRE ??
                  "—"}
              </Text>
            </View>
          </View>

          <Text style={s.ajusteLabel}>Tipo de movimiento</Text>
          <View style={s.tipoMovimientoRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: tipoMovimiento === "entrada" }}
              style={[
                s.btnTipoMovimiento,
                tipoMovimiento === "entrada" && s.btnEntradaActivo,
              ]}
              onPress={() => setTipoMovimiento("entrada")}
            >
              <Text
                style={[
                  s.btnTipoMovimientoTexto,
                  tipoMovimiento === "entrada" &&
                    s.btnTipoMovimientoTextoActivo,
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={normalize(17)}
                  color={tipoMovimiento === "entrada" ? "white" : gb.green600}
                />
                Entrada
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: tipoMovimiento === "salida" }}
              style={[
                s.btnTipoMovimiento,
                tipoMovimiento === "salida" && s.btnSalidaActivo,
              ]}
              onPress={() => setTipoMovimiento("salida")}
            >
              <Text
                style={[
                  s.btnTipoMovimientoTexto,
                  tipoMovimiento === "salida" && s.btnTipoMovimientoTextoActivo,
                ]}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={normalize(17)}
                  color={tipoMovimiento === "salida" ? "white" : gb.red600}
                />
                Salida
              </Text>
            </Pressable>
          </View>

          <Text style={s.ajusteLabel}>Cantidad</Text>
          <View style={s.ajusteRow}>
            {AJUSTES.map(({ valor, label }) => (
              <Pressable
                key={label}
                style={({ pressed }) => [
                  s.btnAjuste,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => aplicarAjuste(valor)}
              >
                <Text style={s.btnAjusteTexto}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={s.inputCantidadWrapper}>
            <TextInput
              style={s.inputCantidad}
              value={cantidad}
              placeholder="0"
              placeholderTextColor={gb.gray300}
              onChangeText={(v) => {
                if (/^\d*\.?\d*$/.test(v)) setCantidad(v);
              }}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            {seleccionado.UNIDAD_ABREVIACION ? (
              <Text style={s.inputUnidadLabel}>
                {seleccionado.UNIDAD_ABREVIACION}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              s.resultado,
              tipoMovimiento === "entrada"
                ? s.resultadoEntrada
                : s.resultadoSalida,
            ]}
          >
            <Text style={s.resultadoEtiqueta}>
              Stock después del movimiento
            </Text>
            <Text style={s.resultadoValor}>
              {fmtStock(nuevoStock)} {seleccionado.UNIDAD_ABREVIACION ?? ""}
            </Text>
          </View>

          <Button
            style={s.btnCero}
            onPress={() => {
              setTipoMovimiento("salida");
              setCantidad(fmtStock(seleccionado.STOCK_ACTUAL));
            }}
          >
            <Text style={s.btnCeroTexto}>Dar salida a todo el stock</Text>
          </Button>

          <View style={s.modalBotonesRow}>
            <Button style={s.btnCancelar} onPress={onClose}>
              <Text style={s.btnCancelarTexto}>Cancelar</Text>
            </Button>
            <Button
              gradient={gb.gradient_blue}
              style={s.btnGuardar}
              onPress={guardar}
              disabled={guardando}
            >
              <Text style={s.btnGuardarTexto}>
                {guardando ? "Guardando..." : `Registrar ${tipoMovimiento}`}
              </Text>
            </Button>
          </View>
        </View>
      )}
    </GeneralModal>
  );
};

const s = StyleSheet.create({
  modalInner: {
    width: "100%",
    gap: normalize(14),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
    paddingBottom: normalize(10),
  },
  modalNombre: {
    fontSize: normalize(16),
    fontWeight: "700",
    color: gb.purple800,
    textAlign: "center",
  },
  uuid: {
    fontSize: normalize(11),
    color: gb.gray400,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: gb.gray100,
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(8),
  },
  infoItem: {
    alignItems: "center",
    gap: normalize(2),
  },
  infoLabel: {
    fontSize: normalize(10),
    color: gb.gray400,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: normalize(16),
    fontWeight: "bold",
    color: gb.purple800,
  },
  infoValueUnidad: {
    fontSize: normalize(14),
    fontWeight: "600",
    color: gb.purple550,
  },
  ajusteLabel: {
    fontSize: normalize(12),
    color: gb.gray400,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: normalize(4),
  },
  ajusteRow: {
    flexDirection: "row",
    gap: normalize(6),
    justifyContent: "center",
  },
  tipoMovimientoRow: {
    flexDirection: "row",
    gap: normalize(8),
  },
  btnTipoMovimiento: {
    flex: 1,
    height: normalize(42),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: gb.gray300,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  btnEntradaActivo: {
    backgroundColor: gb.green600,
    borderColor: gb.green600,
  },
  btnSalidaActivo: {
    backgroundColor: gb.red600,
    borderColor: gb.red600,
  },
  btnTipoMovimientoTexto: {
    fontSize: normalize(14),
    fontWeight: "700",
    color: gb.gray500,
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(5),
  },
  btnTipoMovimientoTextoActivo: {
    color: "white",
  },
  btnAjuste: {
    flex: 1,
    height: normalize(38),
    borderRadius: normalize(10),
    backgroundColor: gb.gray100,
    borderWidth: 1,
    borderColor: gb.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAjusteTexto: {
    fontSize: normalize(13),
    fontWeight: "700",
    color: gb.purple800,
  },
  inputCantidadWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: gb.gray300,
    borderRadius: normalize(8),
    overflow: "hidden",
    backgroundColor: "white",
  },
  inputCantidad: {
    flex: 1,
    textAlign: "center",
    fontSize: normalize(22),
    fontWeight: "bold",
    color: gb.purple800,
    paddingVertical: normalize(10),
  },
  inputUnidadLabel: {
    paddingHorizontal: normalize(12),
    color: gb.gray400,
    fontSize: normalize(14),
  },
  resultado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: normalize(8),
    borderWidth: 1,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
  },
  resultadoEntrada: {
    backgroundColor: gb.green50,
    borderColor: gb.green300,
  },
  resultadoSalida: {
    backgroundColor: gb.red50,
    borderColor: gb.red300,
  },
  resultadoEtiqueta: {
    fontSize: normalize(12),
    color: gb.gray600,
  },
  resultadoValor: {
    fontSize: normalize(17),
    fontWeight: "700",
    color: gb.purple800,
  },
  btnCero: {
    borderWidth: 1.5,
    borderColor: gb.yellow400,
    borderRadius: normalize(8),
    paddingVertical: normalize(11),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: gb.yellow50,
  },
  btnCeroTexto: {
    fontSize: normalize(13),
    fontWeight: "600",
    color: gb.yellow600,
  },
  modalBotonesRow: {
    flexDirection: "row",
    gap: normalize(10),
  },
  btnCancelar: {
    flex: 1,
    height: normalize(44),
    borderRadius: normalize(8),
    backgroundColor: gb.gray100,
    borderWidth: 1,
    borderColor: gb.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelarTexto: {
    fontSize: normalize(14),
    color: gb.gray500,
    fontWeight: "600",
  },
  btnGuardar: {
    flex: 1,
    height: normalize(44),
    borderRadius: normalize(8),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGuardarTexto: {
    fontSize: normalize(14),
    color: "white",
    fontWeight: "700",
  },
});

export default ModalAjustarInventario;
