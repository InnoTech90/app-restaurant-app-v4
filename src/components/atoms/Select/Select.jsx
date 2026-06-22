import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { s } from "./style";

/**
 * Select / Dropdown genérico
 * @param {string}   label        - Etiqueta encima del selector
 * @param {Array}    options      - [{ label, value }]
 * @param {*}        value        - Valor seleccionado actualmente
 * @param {Function} onChange     - Callback (value) => void
 * @param {string}   placeholder  - Texto cuando no hay selección
 * @param {object}   style        - Override del contenedor
 */
const Select = ({ label, options = [], value, onChange, placeholder = "Seleccionar...", style }) => {
    const [abierto, setAbierto] = useState(false);

    const opcionSeleccionada = options.find(o => o.value === value);

    const seleccionar = (opcion) => {
        onChange(opcion.value);
        setAbierto(false);
    };

    return (
        <View style={[s.contenedor, style]}>
            {label && <Text style={s.label}>{label}</Text>}

            <Pressable style={s.selector} onPress={() => setAbierto(true)}>
                <Text style={[s.textoSelector, !opcionSeleccionada && s.placeholder]}>
                    {opcionSeleccionada ? opcionSeleccionada.label : placeholder}
                </Text>
                <Ionicons name={abierto ? "chevron-up" : "chevron-down"} size={16} style={s.icono} />
            </Pressable>

            <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
                <Pressable style={s.overlay} onPress={() => setAbierto(false)}>
                    <View style={s.dropdown}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.value)}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[s.opcion, item.value === value && s.opcionActiva]}
                                    onPress={() => seleccionar(item)}
                                >
                                    <Text style={[s.textoOpcion, item.value === value && s.textoOpcionActivo]}>
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Ionicons name="checkmark" size={16} style={s.iconoCheck} />
                                    )}
                                </Pressable>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Select;
