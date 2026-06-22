import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";

const fmtStock = (val) =>
    val !== null && val !== undefined ? String(parseFloat(val)) : "0";

const AJUSTES = [
    { valor: -10, label: "-10", rojo: true },
    { valor: -5,  label: "-5",  rojo: true },
    { valor: -1,  label: "-1",  rojo: true },
    { valor: +1,  label: "+1",  rojo: false },
    { valor: +5,  label: "+5",  rojo: false },
    { valor: +10, label: "+10", rojo: false },
];

/**
 * Modal para ajustar el stock de una materia prima.
 * @param {object}   seleccionado  - Item activo (null = cerrado)
 * @param {function} onClose       - Cierra el modal
 * @param {function} onGuardar     - async (uuidSucursal, nuevoStock) => void
 */
const ModalAjustarInventario = ({ seleccionado, onClose, onGuardar }) => {
    const [cantidad, setCantidad] = useState("0");
    const [guardando, setGuardando] = useState(false);

    // Sincronizar cantidad cuando cambia el item seleccionado
    useEffect(() => {
        if (seleccionado) {
            setCantidad(fmtStock(seleccionado.STOCK_ACTUAL));
        }
    }, [seleccionado]);

    const aplicarAjuste = (delta) => {
        setCantidad((prev) => {
            const actual = parseFloat(prev) || 0;
            const nuevo  = Math.max(0, actual + delta);
            return String(nuevo);
        });
    };

    const guardar = async () => {
        setGuardando(true);
        try {
            const nuevoStock = parseFloat(cantidad) || 0;
            await onGuardar(seleccionado.UUID_SUCURSAL, nuevoStock);
            onClose();
        } catch (e) {
            console.error("Error guardando stock:", e);
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
                                {seleccionado.UNIDAD_ABREVIACION ?? seleccionado.UNIDAD_NOMBRE ?? "—"}
                            </Text>
                        </View>
                    </View>

                    {/* Ajuste rápido */}
                    <Text style={s.ajusteLabel}>Ajuste rápido</Text>
                    <View style={s.ajusteRow}>
                        {AJUSTES.map(({ valor, label, rojo }) => (
                            <Pressable
                                key={label}
                                style={({ pressed }) => [
                                    rojo ? s.btnAjusteRojo : s.btnAjusteVerde,
                                    { opacity: pressed ? 0.7 : 1 },
                                ]}
                                onPress={() => aplicarAjuste(valor)}
                            >
                                <Text style={rojo ? s.btnAjusteTextoRojo : s.btnAjusteTextoVerde}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Input cantidad */}
                    <View style={s.inputCantidadWrapper}>
                        <TextInput
                            style={s.inputCantidad}
                            value={cantidad}
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

                    {/* Marcar como 0 */}
                    <Button style={s.btnCero} onPress={() => setCantidad("0")}>
                        <Text style={s.btnCeroTexto}>Marcar como 0</Text>
                    </Button>

                    {/* Cancelar / Guardar */}
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
                                {guardando ? "Guardando..." : "Guardar"}
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
    btnAjusteRojo: {
        flex: 1,
        height: normalize(38),
        borderRadius: normalize(10),
        backgroundColor: gb.red50,
        borderWidth: 1,
        borderColor: gb.red300,
        alignItems: "center",
        justifyContent: "center",
    },
    btnAjusteVerde: {
        flex: 1,
        height: normalize(38),
        borderRadius: normalize(10),
        backgroundColor: gb.green50,
        borderWidth: 1,
        borderColor: gb.green300,
        alignItems: "center",
        justifyContent: "center",
    },
    btnAjusteTextoRojo: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.red600,
    },
    btnAjusteTextoVerde: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.green600,
    },
    inputCantidadWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: gb.gray300,
        borderRadius: normalize(12),
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
    btnCero: {
        borderWidth: 1.5,
        borderColor: gb.yellow400,
        borderRadius: normalize(22),
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
        borderRadius: normalize(22),
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
        borderRadius: normalize(22),
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
