import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "../../atoms/FondoSolido/FondoSolido";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { gb } from "../../../screens/globalStyles";
import { mostrarAviso } from "../../../utils/avisoModal";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import Select from "../../atoms/Select/Select";
import ModalWarning from "../ModalWarning/ModalWarning";
import { s } from "./styles";

import { color as tema } from "../../../utils/theme";
const sameId = (a, b) =>
  a != null && b != null && Number(a) === Number(b);

/** Cambio que se le da a un cliente: lo que entregó menos lo que le toca. */
export const cambioDe = (recibido, monto) => {
  const r = parseFloat(recibido);
  if (!Number.isFinite(r) || r <= 0) return 0;
  return Math.max(0, Math.round((r - (parseFloat(monto) || 0)) * 100) / 100);
};

const FilaPago = ({ index, fila, sugerido, formatosPago, onChange, disabled }) => {
  const inputRef = useRef(null);

  const handleMonto = (texto) => {
    const limpio = texto.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    onChange({ ...fila, monto: limpio });
  };

  // Si el campo está vacío se usa lo que le toca (se ve en el placeholder).
  const montoEfectivo = fila.monto !== "" ? fila.monto : sugerido;
  const esValida = parseFloat(montoEfectivo) > 0 && fila.formaPago != null;

  // "Paga con": lo que entrega el cliente; si es más que su parte, cambio.
  const handleRecibido = (texto) => {
    const limpio = texto.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    onChange({ ...fila, recibido: limpio });
  };
  const cambio = cambioDe(fila.recibido, montoEfectivo);
  const faltante =
    fila.recibido !== "" && fila.recibido != null &&
    parseFloat(fila.recibido) > 0 &&
    parseFloat(fila.recibido) < (parseFloat(montoEfectivo) || 0);

  return (
    <View style={[s.filaBloque, fila.pagado && s.filaPagada]}>
    <View style={s.fila}>
      <View style={s.filaNum}>
        <Text style={s.filaNumTexto}>{index + 1}</Text>
      </View>

      <Pressable
        onPress={() => {
          if (disabled) return;
          if (!esValida && !fila.pagado) return;
          onChange({
            ...fila,
            monto: fila.monto !== "" ? fila.monto : sugerido,
            pagado: !fila.pagado,
          });
        }}
        style={[
          s.check,
          fila.pagado && s.checkActivo,
          !esValida && !fila.pagado && s.checkDisabled,
        ]}
      >
        {fila.pagado && (
          <Ionicons name="checkmark" size={normalize(13)} color="#FFFFFF" />
        )}
      </Pressable>

      <View style={s.montoWrap}>
        <Text style={s.montoSimbolo}>$</Text>
        <TextInput
          ref={inputRef}
          style={s.montoInput}
          value={fila.monto}
          onChangeText={handleMonto}
          keyboardType="decimal-pad"
          placeholder={sugerido || "0.00"}
          placeholderTextColor={gb.gray400}
          editable={!disabled}
          selectTextOnFocus
        />
      </View>

      <View style={s.selectWrap}>
        <Select
          options={formatosPago}
          value={fila.formaPago}
          onChange={(v) => {
            if (disabled) return;
            onChange({ ...fila, formaPago: v });
          }}
          placeholder="Método"
          style={s.selectInline}
        />
      </View>
    </View>
    <View style={s.filaRecibido}>
      <Text style={s.recibidoLabel}>Paga con</Text>
      <View style={s.recibidoWrap}>
        <Text style={s.montoSimbolo}>$</Text>
        <TextInput
          style={s.recibidoInput}
          value={fila.recibido ?? ""}
          onChangeText={handleRecibido}
          keyboardType="decimal-pad"
          placeholder={montoEfectivo || "0.00"}
          placeholderTextColor={gb.gray400}
          editable={!disabled}
          selectTextOnFocus
        />
      </View>
      {cambio > 0 ? (
        <Text style={s.cambioTexto}>Cambio ${cambio.toFixed(2)}</Text>
      ) : faltante ? (
        <Text style={s.faltaTexto}>Falta dinero</Text>
      ) : (
        <Text style={s.recibidoAyuda}>Sin cambio</Text>
      )}
    </View>
    </View>
  );
};

/**
 * @param {boolean}   visible
 * @param {Function}  onClose
 * @param {number}    total
 * @param {Array}     formatosPago
 * @param {number}    formatoPagoDefault
 * @param {Function}  onGuardar
 * @param {Function}  onLimpiar   - limpia división guardada
 * @param {Array}     filasGuardadas
 * @param {boolean}   disabled
 */
const ModalDividirCuenta = ({
  visible,
  onClose,
  total = 0,
  formatosPago = [],
  formatoPagoDefault = null,
  onGuardar,
  onLimpiar,
  filasGuardadas = [],
  disabled = false,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const yaGuardado = filasGuardadas.length > 0;

  const opcionesPago = formatosPago.map((f) => ({
    label: f.label ?? f.NOMBRE,
    value: f.value ?? f.ID,
  }));

  const crearFilas = (n, tot, fpDefault, dividir = false) => {
    const montoBase = dividir && tot > 0 ? (tot / n).toFixed(2) : "";
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      monto: montoBase,
      recibido: "",
      formaPago: fpDefault,
      pagado: false,
    }));
  };

  const mapearGuardadas = (guardadas) =>
    guardadas.map((f, i) => ({
      id: i,
      monto: Number(f.TOTAL ?? 0).toFixed(2),
      recibido: "",
      formaPago:
        f.FORMA_PAGO != null ? Number(f.FORMA_PAGO) : formatoPagoDefault,
      pagado: true,
    }));

  const [numClientes, setNumClientes] = useState(2);
  const [filas, setFilas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [openConfirmLimpiar, setOpenConfirmLimpiar] = useState(false);

  useEffect(() => {
    if (!visible) {
      setOpenConfirmLimpiar(false);
      return;
    }
    if (filasGuardadas.length > 0) {
      const mapped = mapearGuardadas(filasGuardadas);
      setFilas(mapped);
      setNumClientes(mapped.length);
    } else {
      setFilas(crearFilas(2, total, formatoPagoDefault));
      setNumClientes(2);
    }
  }, [visible, filasGuardadas, total, formatoPagoDefault]);

  const dividirIgual = () => {
    if (disabled) return;
    setFilas(crearFilas(numClientes, total, formatoPagoDefault, true));
  };

  const cambiarNumClientes = (n) => {
    if (disabled) return;
    const sanitized = Math.max(1, Math.min(20, n));
    setNumClientes(sanitized);
    setFilas(crearFilas(sanitized, total, formatoPagoDefault, false));
  };

  const handleChangeFila = (index, nuevaFila) => {
    if (disabled) return;
    setFilas((prev) => prev.map((f, i) => (i === index ? nuevaFila : f)));
  };

  // Lo que le toca a cada quien: lo que falta por capturar repartido entre
  // las filas sin monto. Va como placeholder y se usa si dejan el campo vacío.
  const capturadoManual = filas.reduce(
    (sum, f) => sum + (f.monto !== "" ? parseFloat(f.monto) || 0 : 0),
    0,
  );
  const filasVacias = filas.filter((f) => f.monto === "").length;
  const sugerido =
    filasVacias > 0 && total - capturadoManual > 0
      ? ((total - capturadoManual) / filasVacias).toFixed(2)
      : "";
  const montoDe = (f) => parseFloat(f.monto !== "" ? f.monto : sugerido) || 0;

  const todasPagadas = filas.length > 0 && filas.every((f) => f.pagado);
  const todasValidas = filas.every((f) => montoDe(f) > 0 && f.formaPago != null);

  const toggleTodas = () => {
    if (disabled) return;
    if (!todasValidas && !todasPagadas) return;
    setFilas((prev) =>
      prev.map((f) => ({
        ...f,
        monto: f.monto !== "" ? f.monto : sugerido,
        pagado: !todasPagadas,
      })),
    );
  };

  const totalCapturado = filas.reduce((sum, f) => sum + montoDe(f), 0);
  const totalPagado = filas.reduce(
    (sum, f) => sum + (f.pagado ? montoDe(f) : 0),
    0,
  );
  const totalPendiente = Math.max(0, total - totalPagado);
  const montosCuadran = Math.abs(totalCapturado - total) <= 0.01;

  const handleGuardar = async () => {
    if (disabled) return;
    if (!todasValidas) {
      mostrarAviso({
        type: "warning",
        title: "Datos incompletos",
        message: "Captura el monto y método de pago de cada cliente.",
      });
      return;
    }
    if (!montosCuadran) {
      mostrarAviso({
        type: "warning",
        title: "Montos incorrectos",
        message: `La suma de los pagos ($${totalCapturado.toFixed(2)}) debe ser igual al total de la comanda ($${total.toFixed(2)}).`,
      });
      return;
    }
    if (!todasPagadas) {
      mostrarAviso({
        type: "warning",
        title: "Check pendiente",
        message: "Todos los clientes deben estar marcados como pagados.",
      });
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(
        filas.map((f) => ({
          cantidad: 1,
          total: montoDe(f),
          formaPago: f.formaPago,
        })),
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleLimpiar = () => {
    if (disabled) return;
    setOpenConfirmLimpiar(true);
  };

  const confirmarLimpiar = async () => {
    setOpenConfirmLimpiar(false);
    try {
      await onLimpiar?.();
      setFilas(crearFilas(2, total, formatoPagoDefault));
      setNumClientes(2);
    } catch (e) {
      console.error("Error limpiando división:", e);
    }
  };

  const nombreMetodo = (id) =>
    opcionesPago.find((f) => sameId(f.value, id))?.label ?? "—";

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={[s.sheet, { height: screenHeight * 0.88 }]}>
          <LinearGradient
            colors={[tema.surface, tema.surface]}
            style={s.header}
          >
            <Text style={s.headerTitulo}>
              {yaGuardado ? "Editar división" : "Dividir cuenta"}
            </Text>
            <Pressable onPress={onClose} style={s.headerClose}>
              <Ionicons name="close" size={normalize(22)} color={tema.textSecondary} />
            </Pressable>
          </LinearGradient>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>Total a dividir</Text>
              <Text style={s.totalValor}>${total.toFixed(2)}</Text>
            </View>

            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons
                  name="people-outline"
                  size={normalize(16)}
                  color={gb.blue550}
                />
                <Text style={s.cardHeaderTitulo}>Configuración</Text>
              </View>
              <View style={s.configRow}>
                <Text style={s.configLabel}>Número de clientes</Text>
                <View style={s.counter}>
                  <Pressable
                    style={s.counterBtn}
                    onPress={() => cambiarNumClientes(numClientes - 1)}
                    disabled={disabled || numClientes <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={normalize(18)}
                      color={
                        disabled || numClientes <= 1 ? gb.gray300 : gb.blue550
                      }
                    />
                  </Pressable>
                  <Text style={s.counterValor}>{numClientes}</Text>
                  <Pressable
                    style={s.counterBtn}
                    onPress={() => cambiarNumClientes(numClientes + 1)}
                    disabled={disabled || numClientes >= 20}
                  >
                    <Ionicons
                      name="add"
                      size={normalize(18)}
                      color={
                        disabled || numClientes >= 20 ? gb.gray300 : gb.blue550
                      }
                    />
                  </Pressable>
                </View>
              </View>
              {!disabled && (
                <Button
                  styleContainer={s.btnDividirIgualContainer}
                  style={s.btnDividirIgual}
                  gradient={gb.gradient_blue}
                  onPress={dividirIgual}
                >
                  <Ionicons
                    name="git-branch-outline"
                    size={normalize(16)}
                    color="#FFFFFF"
                  />
                  <Text style={s.btnDividirIgualTexto}>Dividir igual</Text>
                </Button>
              )}
            </View>

            <View style={s.card}>
              <Pressable style={s.listHeader} onPress={toggleTodas}>
                <View style={s.listHeaderLeft}>
                  <Ionicons
                    name="wallet-outline"
                    size={normalize(16)}
                    color={gb.blue550}
                  />
                  <Text style={s.cardHeaderTitulo}>Pagos por cliente</Text>
                </View>
                <View style={[s.check, todasPagadas && s.checkActivo]}>
                  {todasPagadas && (
                    <Ionicons
                      name="checkmark"
                      size={normalize(13)}
                      color="#FFFFFF"
                    />
                  )}
                </View>
              </Pressable>

              <View style={s.colHeader}>
                <Text style={[s.colTexto, { width: normalize(24) }]}>#</Text>
                <Text style={[s.colTexto, { width: normalize(24) }]}> </Text>
                <Text style={[s.colTexto, { flex: 1 }]}>Monto</Text>
                <Text
                  style={[s.colTexto, { flex: 1.4, textAlign: "right" }]}
                >
                  Método
                </Text>
              </View>

              {filas.map((fila, index) => (
                <FilaPago
                  key={fila.id}
                  index={index}
                  fila={fila}
                  sugerido={sugerido}
                  formatosPago={opcionesPago}
                  onChange={(nueva) => handleChangeFila(index, nueva)}
                  disabled={disabled}
                />
              ))}
            </View>

            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons
                  name="receipt-outline"
                  size={normalize(16)}
                  color={gb.blue550}
                />
                <Text style={s.cardHeaderTitulo}>Resumen</Text>
              </View>

              {filas.map((fila, i) => (
                <View
                  key={i}
                  style={[s.resumenFila, i < filas.length - 1 && s.resumenFilaBorde]}
                >
                  <View style={s.resumenFilaLeft}>
                    <View
                      style={[
                        s.resumenDot,
                        {
                          backgroundColor: fila.pagado
                            ? gb.green500
                            : gb.gray300,
                        },
                      ]}
                    />
                    <Text style={s.resumenNombre}>Cliente {i + 1}</Text>
                  </View>
                  <View style={s.resumenFilaRight}>
                    <Text style={s.resumenMonto}>
                      ${montoDe(fila).toFixed(2)}
                    </Text>
                    <Text style={s.resumenMetodo}>
                      {nombreMetodo(fila.formaPago)}
                    </Text>
                    {cambioDe(fila.recibido, montoDe(fila)) > 0 ? (
                      <Text style={s.resumenCambio}>
                        Cambio ${cambioDe(fila.recibido, montoDe(fila)).toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}

              <View style={s.resumenTotal}>
                <View style={s.resumenTotalFila}>
                  <Text style={s.resumenTotalLabel}>Suma capturada</Text>
                  <Text
                    style={[
                      s.resumenTotalValor,
                      { color: montosCuadran ? gb.green600 : gb.red600 },
                    ]}
                  >
                    ${totalCapturado.toFixed(2)}
                  </Text>
                </View>
                <View style={s.resumenTotalFila}>
                  <Text style={s.resumenTotalLabel}>Total pagado</Text>
                  <Text style={[s.resumenTotalValor, { color: gb.green600 }]}>
                    ${totalPagado.toFixed(2)}
                  </Text>
                </View>
                <View style={s.resumenTotalFila}>
                  <Text style={s.resumenTotalLabel}>Pendiente</Text>
                  <Text
                    style={[
                      s.resumenTotalValor,
                      {
                        color:
                          totalPendiente > 0 ? gb.red600 : gb.green600,
                      },
                    ]}
                  >
                    ${totalPendiente.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={s.footerBtns}>
            {disabled ? (
              <Button
                styleContainer={[s.btnGuardarContainer, { flex: 1 }]}
                style={s.btnGuardar}
                onPress={onClose}
              >
                <Text style={s.btnGuardarTexto}>Cerrar</Text>
              </Button>
            ) : (
              <>
                {yaGuardado && onLimpiar ? (
                  <Button
                    styleContainer={s.btnCancelarContainer}
                    style={s.btnCancelar}
                    onPress={handleLimpiar}
                  >
                    <Text style={s.btnCancelarTexto}>Quitar</Text>
                  </Button>
                ) : (
                  <Button
                    styleContainer={s.btnCancelarContainer}
                    style={s.btnCancelar}
                    onPress={onClose}
                  >
                    <Text style={s.btnCancelarTexto}>Cancelar</Text>
                  </Button>
                )}
                <Button
                  styleContainer={s.btnGuardarContainer}
                  style={[
                    s.btnGuardar,
                    (!todasPagadas || guardando) && s.btnGuardarDisabled,
                  ]}
                  onPress={handleGuardar}
                  disabled={!todasPagadas || guardando}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={normalize(18)}
                    color="#FFFFFF"
                  />
                  <Text style={s.btnGuardarTexto}>
                    {guardando
                      ? "Guardando…"
                      : yaGuardado
                        ? "Actualizar pago"
                        : "Guardar pago"}
                  </Text>
                </Button>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>

    <ModalWarning
      visible={openConfirmLimpiar}
      type="danger"
      title="Quitar división"
      message="Se eliminará el pago dividido guardado. ¿Continuar?"
      confirmText="Quitar"
      cancelText="Cancelar"
      onCancel={() => setOpenConfirmLimpiar(false)}
      onConfirm={confirmarLimpiar}
    />
    </>
  );
};

export default ModalDividirCuenta;
