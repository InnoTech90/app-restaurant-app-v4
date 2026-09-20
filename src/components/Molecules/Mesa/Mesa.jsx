import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Input from "../../atoms/Input/Input";
import Tooltip from "../../atoms/Tooltip/Tooltip";
import { s } from "./styles";

const Mesa = ({
  id,
  uuid,
  nombre,
  status,
  onPress,
  onLongPress,
  descripcion,
  index = 1,
  mesas,
  onCambiarMesa,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [cambiarMesa, setCambiarMesa] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  // Solo mesas libres (sin comanda activa), excluyendo la actual
  const mesasDestino = useMemo(
    () =>
      (mesas ?? []).filter(
        (mesa) =>
          mesa.UUID !== uuid &&
          Number(mesa.TIENE_COMANDA_ACTIVA) !== 1,
      ),
    [mesas, uuid],
  );

  const changeMesa = async (uuidMesaDestino) => {
    if (!uuid || !uuidMesaDestino || cambiando) return;
    try {
      setCambiando(true);
      await onCambiarMesa?.(uuid, uuidMesaDestino);
      setCambiarMesa(false);
    } catch (e) {
      console.error("Error al cambiar mesa:", e);
      Alert.alert(
        "No se pudo cambiar",
        e?.code === "MESA_OCUPADA"
          ? "La mesa seleccionada ya está ocupada."
          : e?.message || "Intenta de nuevo.",
      );
    } finally {
      setCambiando(false);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => {
        setShowTooltip(true);
        onLongPress?.();
      }}
      onPressOut={() => setShowTooltip(false)}
      delayLongPress={700}
      style={s.mesaContainer}
    >
      {status ? (
        <View
          style={[
            s.mesa,
            { borderColor: gb.purple550, backgroundColor: gb.blue50 },
          ]}
        >
          <View style={[s.sillaLeft, { backgroundColor: gb.purple550 }]} />
          <View style={[s.sillaRight, { backgroundColor: gb.purple550 }]} />
          <View style={[s.sillaTop, { backgroundColor: gb.purple550 }]} />
          <View style={[s.sillaBottom, { backgroundColor: gb.purple550 }]} />
          <View style={s.contenido}>
            <Text style={s.nombre}>{nombre} </Text>
            <Text style={s.ficha}>Ficha : {id} </Text>
            <Input placeholder="Nota" style={{ marginTop: 10, width: "80%" }} />
            <Button
              onPress={() => setCambiarMesa(true)}
              style={s.cambiarMesa}
            >
              <Text style={{ color: gb.gray50 }}>Cambiar Mesa</Text>
            </Button>
          </View>
          <Tooltip visible={showTooltip}>{descripcion}</Tooltip>
        </View>
      ) : (
        <View style={s.mesa}>
          <View style={s.sillaLeft} />
          <View style={s.sillaRight} />
          <View style={s.sillaTop} />
          <View style={s.sillaBottom} />
          <View style={s.contenido}>
            <Text style={s.nombre}>{nombre} </Text>
          </View>
          <Tooltip visible={showTooltip}>{descripcion}</Tooltip>
        </View>
      )}
      <GeneralModal
        visible={cambiarMesa}
        onRequestClose={() => setCambiarMesa(false)}
        headerColorGrandien={[gb.purple750, gb.purple350]}
        iconCloseColor={"white"}
        headerColorText={gb.gray50}
        headerTitle={"Cambiar mesa"}
      >
        <Text style={s.instrucciones}>
          Selecciona la mesa destino para la comanda de {nombre}
        </Text>
        <View style={s.contenedorFichaActual}>
          <Ionicons
            name="information-circle"
            size={normalize(16)}
            color={gb.purple750}
            style={{ marginRight: normalize(5) }}
          />
          <Text style={s.mesaActualFolio}>
            {nombre} - Ficha {id}
          </Text>
        </View>
        <View style={s.listaMesas}>
          {mesasDestino.length > 0 ? (
            mesasDestino.map((mesa) => (
              <Button
                key={mesa.UUID ?? mesa.ID}
                style={s.mesaItem}
                disabled={cambiando}
                onPress={() => changeMesa(mesa.UUID)}
              >
                <Text style={s.textoMesa}>{mesa.NOMBRE}</Text>
              </Button>
            ))
          ) : (
            <View style={s.noDataContainer}>
              <Ionicons
                name="alert-circle"
                size={normalize(40)}
                color={gb.gray300}
                style={{ marginBottom: normalize(10) }}
              />
              <Text style={s.textoMesa}>No hay mesas libres</Text>
              <Text style={s.textoMesaDescripcion}>
                Todas las demás mesas están ocupadas
              </Text>
              <Button
                onPress={() => setCambiarMesa(false)}
                style={s.cerrarButton}
              >
                <Text style={{ color: gb.gray400 }}>Cerrar</Text>
              </Button>
            </View>
          )}
        </View>
      </GeneralModal>
    </Pressable>
  );
};

export default Mesa;
