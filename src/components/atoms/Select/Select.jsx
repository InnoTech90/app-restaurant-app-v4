import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { s } from "./style";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Seleccionar...",
  style,
}) => {
  const [abierto, setAbierto] = useState(false);

  const opcionSeleccionada = options.find(
    (o) => String(o.value) === String(value),
  );

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
        <Ionicons
          name={abierto ? "chevron-up" : "chevron-down"}
          size={16}
          style={s.icono}
        />
      </Pressable>

      <Modal
        visible={abierto}
        transparent
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
      >
        <View style={s.overlay}>
          <Pressable style={s.overlayDismiss} onPress={() => setAbierto(false)} />
          <View style={s.dropdown}>
            {options.length === 0 ? (
              <Text style={s.vacioTexto}>Sin opciones disponibles</Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const activa = String(item.value) === String(value);
                  return (
                    <Pressable
                      style={[s.opcion, activa && s.opcionActiva]}
                      onPress={() => seleccionar(item)}
                    >
                      <Text
                        style={[s.textoOpcion, activa && s.textoOpcionActivo]}
                      >
                        {item.label}
                      </Text>
                      {activa && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          style={s.iconoCheck}
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Select;
