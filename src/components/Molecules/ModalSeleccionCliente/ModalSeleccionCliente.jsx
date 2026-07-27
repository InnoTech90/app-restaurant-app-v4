import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Buscador from "../../atoms/Buscador/Buscador";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import { s } from "./styles";

const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const ModalSeleccionCliente = ({
  visible,
  onClose,
  clientes,
  clienteSeleccionado,
  busqueda,
  onCambiarBusqueda,
  onSeleccionar,
}) => {
  return (
    <GeneralModal
      visible={visible}
      onRequestClose={onClose}
      headerTitle="Seleccionar cliente"
      headerColorGrandien={gb.gradient_blue}
      headerColorText={gb.gray50}
      iconCloseColor={gb.gray50}
      scrollable={false}
    >
      <View style={s.buscadorWrapper}>
        <Buscador
          placeholder="Buscar cliente..."
          value={busqueda}
          onChangeText={onCambiarBusqueda}
        />
      </View>
      <FlatList
        data={clientes}
        keyExtractor={(item) => String(item.ID)}
        contentContainerStyle={{ paddingBottom: normalize(20) }}
        ListHeaderComponent={
          <Button
            styleContainer={s.itemContainer}
            style={s.itemBoton}
            onPress={() => onSeleccionar(null)}
          >
            <View style={[s.avatar, { backgroundColor: gb.gray200 }]}>
              <Ionicons
                name="person-outline"
                size={normalize(18)}
                color={gb.gray500}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.nombre}>Sin cliente</Text>
            </View>
            {!clienteSeleccionado && (
              <Ionicons
                name="checkmark-circle"
                size={normalize(20)}
                color={gb.green500}
              />
            )}
          </Button>
        }
        ListEmptyComponent={
          <Text style={s.vacio}>Sin clientes registrados</Text>
        }
        renderItem={({ item }) => (
          <Button
            styleContainer={s.itemContainer}
            style={s.itemBoton}
            onPress={() => onSeleccionar(item)}
          >
            <View style={s.avatar}>
              <Text style={s.avatarTexto}>{iniciales(item.NOMBRE)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.nombre}>{item.NOMBRE}</Text>
              {!!item.TELEFONO && (
                <Text style={s.telefono}>{item.TELEFONO}</Text>
              )}
            </View>
            {clienteSeleccionado?.ID === item.ID && (
              <Ionicons
                name="checkmark-circle"
                size={normalize(20)}
                color={gb.green500}
              />
            )}
          </Button>
        )}
      />
    </GeneralModal>
  );
};

export default ModalSeleccionCliente;
