import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View
} from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import Select from "../../atoms/Select/Select";
import { s } from "./styles";

// ─────────────────────────────────────────────────────────────────────────────
//  Fila de pago por cliente
// ─────────────────────────────────────────────────────────────────────────────
const FilaPago = ({ index, fila, formatosPago, onChange, readonly }) => {
    const inputRef = useRef(null);

    const handleMonto = (texto) => {
        // Solo números y punto decimal
        const limpio = texto.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
        onChange({ ...fila, monto: limpio });
    };

    const esValida = fila.monto !== "" && parseFloat(fila.monto) > 0 && fila.formaPago != null;

    return (
        <View style={[s.fila, fila.pagado && s.filaPagada]}>
            {/* Número */}
            <View style={s.filaNum}>
                <Text style={s.filaNumTexto}>{index + 1}</Text>
            </View>

            {/* Check rojo (solo habilitar si tiene monto y forma de pago) */}
            <Pressable
                onPress={() => {
                    if (readonly) return;
                    if (!esValida && !fila.pagado) return;
                    onChange({ ...fila, pagado: !fila.pagado });
                }}
                style={[s.check, fila.pagado && s.checkActivo, !esValida && !fila.pagado && s.checkDisabled]}
            >
                {fila.pagado && (
                    <Ionicons name="checkmark" size={normalize(13)} color={gb.gray50} />
                )}
            </Pressable>

            {/* Monto */}
            <View style={s.montoWrap}>
                <Text style={s.montoSimbolo}>$</Text>
                <TextInput
                    ref={inputRef}
                    style={s.montoInput}
                    value={fila.monto}
                    onChangeText={handleMonto}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={gb.gray300}
                    editable={!readonly && !fila.pagado}
                    selectTextOnFocus
                />
            </View>

            {/* Forma de pago */}
            <View style={s.selectWrap}>
                <Select
                    options={formatosPago}
                    value={fila.formaPago}
                    onChange={(v) => {
                        if (readonly || fila.pagado) return;
                        onChange({ ...fila, formaPago: v });
                    }}
                    placeholder="Método"
                    style={s.selectInline}
                />
            </View>
        </View>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Modal principal
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {boolean}   visible
 * @param {Function}  onClose
 * @param {number}    total          - Total de la comanda
 * @param {Array}     formatosPago   - [{ label, value }]
 * @param {number}    formatoPagoDefault - ID del método de pago por defecto
 * @param {Function}  onGuardar      - (filas) => void
 * @param {Array}     filasGuardadas - filas ya persistidas (modo readonly si no vacío)
 */
const ModalDividirCuenta = ({
    visible,
    onClose,
    total = 0,
    formatosPago = [],
    formatoPagoDefault = null,
    onGuardar,
    filasGuardadas = [],
}) => {
    const { height: screenHeight } = useWindowDimensions();
    const readonly = filasGuardadas.length > 0;

    // Normalizar opciones al formato { label, value } que espera Select
    const opcionesPago = formatosPago.map((f) => ({
        label: f.label ?? f.NOMBRE,
        value: f.value ?? f.ID,
    }));

    const crearFilas = (n, tot, fpDefault) => {
        const montoBase = tot > 0 ? (tot / n).toFixed(2) : "0.00";
        return Array.from({ length: n }, (_, i) => ({
            id: i,
            monto: montoBase,
            formaPago: fpDefault,
            pagado: false,
        }));
    };

    const [numClientes, setNumClientes] = useState(2);
    const [filas, setFilas] = useState([]);
    const [guardando, setGuardando] = useState(false);

    // Inicializar al abrir
    useEffect(() => {
        if (!visible) return;
        if (readonly) {
            // Mapear guardadas a estructura local
            setFilas(
                filasGuardadas.map((f, i) => ({
                    id: i,
                    monto: String(f.TOTAL ?? 0),
                    formaPago: f.FORMA_PAGO,
                    pagado: true,
                }))
            );
            setNumClientes(filasGuardadas.length);
        } else {
            setFilas(crearFilas(2, total, formatoPagoDefault));
            setNumClientes(2);
        }
    }, [visible]);

    // ── Dividir igual ────────────────────────────────────────────────────────
    const dividirIgual = () => {
        if (readonly) return;
        setFilas(crearFilas(numClientes, total, formatoPagoDefault));
    };

    // ── Cambiar n° de clientes ───────────────────────────────────────────────
    const cambiarNumClientes = (n) => {
        if (readonly) return;
        const sanitized = Math.max(1, Math.min(20, n));
        setNumClientes(sanitized);
        setFilas(crearFilas(sanitized, total, formatoPagoDefault));
    };

    // ── Editar una fila: redistribuye el resto ────────────────────────────────
    const handleChangeFila = (index, nuevaFila) => {
        if (readonly) return;
        setFilas((prev) => {
            const updated = prev.map((f, i) => (i === index ? nuevaFila : f));

            // Solo redistribuir si cambia el monto (no el check ni el método)
            const montoEditado = parseFloat(nuevaFila.monto) || 0;
            const montoAnterior = parseFloat(prev[index].monto) || 0;
            if (montoEditado === montoAnterior) return updated;

            // Filas no bloqueadas (no pagadas) excepto la editada
            const restantes = updated
                .map((f, i) => ({ f, i }))
                .filter(({ f, i }) => i !== index && !f.pagado);

            if (restantes.length === 0) return updated;

            const sumBloqueadas = updated
                .filter((f, i) => i !== index && f.pagado)
                .reduce((s, f) => s + (parseFloat(f.monto) || 0), 0);

            const disponible = Math.max(0, total - montoEditado - sumBloqueadas);
            const porCada = (disponible / restantes.length).toFixed(2);

            return updated.map((f, i) => {
                if (i === index || f.pagado) return f;
                return { ...f, monto: porCada };
            });
        });
    };

    // ── Select all ───────────────────────────────────────────────────────────
    const todasPagadas = filas.length > 0 && filas.every((f) => f.pagado);
    const todasValidas = filas.every(
        (f) => f.monto !== "" && parseFloat(f.monto) > 0 && f.formaPago !== null
    );

    const toggleTodas = () => {
        if (readonly) return;
        if (!todasValidas && !todasPagadas) return;
        setFilas((prev) => prev.map((f) => ({ ...f, pagado: !todasPagadas })));
    };

    // ── Totales para el resumen ───────────────────────────────────────────────
    const totalPagado = filas.reduce(
        (sum, f) => sum + (f.pagado ? parseFloat(f.monto) || 0 : 0),
        0
    );
    const totalPendiente = Math.max(0, total - totalPagado);

    // ── Guardar ───────────────────────────────────────────────────────────────
    const handleGuardar = async () => {
        if (!todasPagadas) {
            Alert.alert("Check pendiente", "Todos los clientes deben estar marcados como pagados.");
            return;
        }
        setGuardando(true);
        try {
            await onGuardar(
                filas.map((f) => ({
                    cantidad: 1,
                    total: parseFloat(f.monto) || 0,
                    formaPago: f.formaPago,
                }))
            );
        } finally {
            setGuardando(false);
        }
    };

    // ── Nombre de método de pago ──────────────────────────────────────────────
    const nombreMetodo = (id) =>
        opcionesPago.find((f) => f.value === id)?.label ?? "—";

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={[s.sheet, { height: screenHeight * 0.88 }]}>
                    {/* ── Header ────────────────────────────────────── */}
                    <LinearGradient
                        colors={gb.gradient_blue}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.header}
                    >
                        <Text style={s.headerTitulo}>Dividir cuenta</Text>
                        <Pressable onPress={onClose} style={s.headerClose}>
                            <Ionicons name="close" size={normalize(22)} color={gb.gray50} />
                        </Pressable>
                    </LinearGradient>

                    <ScrollView
                        style={s.scroll}
                        contentContainerStyle={s.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* ── Total ─────────────────────────────────── */}
                        <View style={s.totalBox}>
                            <Text style={s.totalLabel}>Total a dividir</Text>
                            <Text style={s.totalValor}>${total.toFixed(2)}</Text>
                        </View>

                        {/* ── Config clientes ────────────────────────── */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <Ionicons name="people-outline" size={normalize(16)} color={gb.blue550} />
                                <Text style={s.cardHeaderTitulo}>Configuración</Text>
                            </View>
                            <View style={s.configRow}>
                                <Text style={s.configLabel}>Número de clientes</Text>
                                <View style={s.counter}>
                                    <Pressable
                                        style={s.counterBtn}
                                        onPress={() => cambiarNumClientes(numClientes - 1)}
                                        disabled={readonly || numClientes <= 1}
                                    >
                                        <Ionicons name="remove" size={normalize(18)} color={numClientes <= 1 ? gb.gray300 : gb.blue550} />
                                    </Pressable>
                                    <Text style={s.counterValor}>{numClientes}</Text>
                                    <Pressable
                                        style={s.counterBtn}
                                        onPress={() => cambiarNumClientes(numClientes + 1)}
                                        disabled={readonly || numClientes >= 20}
                                    >
                                        <Ionicons name="add" size={normalize(18)} color={numClientes >= 20 ? gb.gray300 : gb.blue550} />
                                    </Pressable>
                                </View>
                            </View>
                            {!readonly && (
                                <Button
                                    styleContainer={s.btnDividirIgualContainer}
                                    style={s.btnDividirIgual}
                                    gradient={gb.gradient_blue}
                                    onPress={dividirIgual}
                                >
                                    <Ionicons name="git-branch-outline" size={normalize(16)} color={gb.gray50} />
                                    <Text style={s.btnDividirIgualTexto}>Dividir igual</Text>
                                </Button>
                            )}
                        </View>

                        {/* ── Pagos por cliente ──────────────────────── */}
                        <View style={s.card}>
                            {/* Header con select-all */}
                            <Pressable style={s.listHeader} onPress={toggleTodas}>
                                <View style={s.listHeaderLeft}>
                                    <Ionicons name="wallet-outline" size={normalize(16)} color={gb.blue550} />
                                    <Text style={s.cardHeaderTitulo}>Pagos por cliente</Text>
                                </View>
                                <View style={[s.check, todasPagadas && s.checkActivo]}>
                                    {todasPagadas && (
                                        <Ionicons name="checkmark" size={normalize(13)} color={gb.gray50} />
                                    )}
                                </View>
                            </Pressable>

                            {/* Cabecera columnas */}
                            <View style={s.colHeader}>
                                <Text style={[s.colTexto, { width: normalize(24) }]}>#</Text>
                                <Text style={[s.colTexto, { width: normalize(24) }]}> </Text>
                                <Text style={[s.colTexto, { flex: 1 }]}>Monto</Text>
                                <Text style={[s.colTexto, { flex: 1.4, textAlign: "right" }]}>Método</Text>
                            </View>

                            {filas.map((fila, index) => (
                                <FilaPago
                                    key={fila.id}
                                    index={index}
                                    fila={fila}
                                    formatosPago={opcionesPago}
                                    onChange={(nueva) => handleChangeFila(index, nueva)}
                                    readonly={readonly}
                                />
                            ))}
                        </View>

                        {/* ── Resumen ────────────────────────────────── */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <Ionicons name="receipt-outline" size={normalize(16)} color={gb.blue550} />
                                <Text style={s.cardHeaderTitulo}>Resumen</Text>
                            </View>

                            {filas.map((fila, i) => (
                                <View key={i} style={[s.resumenFila, i < filas.length - 1 && s.resumenFilaBorde]}>
                                    <View style={s.resumenFilaLeft}>
                                        <View style={[s.resumenDot, { backgroundColor: fila.pagado ? gb.green500 : gb.gray300 }]} />
                                        <Text style={s.resumenNombre}>Cliente {i + 1}</Text>
                                    </View>
                                    <View style={s.resumenFilaRight}>
                                        <Text style={s.resumenMonto}>${(parseFloat(fila.monto) || 0).toFixed(2)}</Text>
                                        <Text style={s.resumenMetodo}>{nombreMetodo(fila.formaPago)}</Text>
                                    </View>
                                </View>
                            ))}

                            <View style={s.resumenTotal}>
                                <View style={s.resumenTotalFila}>
                                    <Text style={s.resumenTotalLabel}>Total pagado</Text>
                                    <Text style={[s.resumenTotalValor, { color: gb.green600 }]}>${totalPagado.toFixed(2)}</Text>
                                </View>
                                <View style={s.resumenTotalFila}>
                                    <Text style={s.resumenTotalLabel}>Pendiente</Text>
                                    <Text style={[s.resumenTotalValor, { color: totalPendiente > 0 ? gb.red600 : gb.green600 }]}>
                                        ${totalPendiente.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* ── Footer botones ────────────────────────────── */}
                    {!readonly && (
                        <View style={s.footerBtns}>
                            <Button
                                styleContainer={s.btnCancelarContainer}
                                style={s.btnCancelar}
                                onPress={onClose}
                            >
                                <Text style={s.btnCancelarTexto}>Cancelar</Text>
                            </Button>
                            <Button
                                styleContainer={s.btnGuardarContainer}
                                style={[s.btnGuardar, (!todasPagadas || guardando) && s.btnGuardarDisabled]}
                                onPress={handleGuardar}
                                disabled={!todasPagadas || guardando}
                            >
                                <Ionicons name="checkmark-circle-outline" size={normalize(18)} color={gb.gray50} />
                                <Text style={s.btnGuardarTexto}>{guardando ? "Guardando…" : "Guardar pago"}</Text>
                            </Button>
                        </View>
                    )}
                    {readonly && (
                        <View style={s.footerBtns}>
                            <Button
                                styleContainer={[s.btnGuardarContainer, { flex: 1 }]}
                                style={s.btnGuardar}
                                onPress={onClose}
                            >
                                <Text style={s.btnGuardarTexto}>Cerrar</Text>
                            </Button>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default ModalDividirCuenta;
