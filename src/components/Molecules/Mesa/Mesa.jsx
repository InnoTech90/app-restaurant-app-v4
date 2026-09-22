import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Tooltip from "../../atoms/Tooltip/Tooltip";
import { s } from "./styles";

const Mesa = ({
  id,
  uuid,
  nombre,
  status,
  impresa = false,
  onPress,
  onLongPress,
  descripcion,
  ficha,
  nota: notaProp = "",
  mesas,
  onCambiarMesa,
  onGuardarNota,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [cambiarMesa, setCambiarMesa] = useState(false);
  const [cambiando, setCambiando] = useState(false);
  const [nota, setNota] = useState(notaProp ?? "");

  useEffect(() => {
    setNota(notaProp ?? "");
  }, [notaProp]);

  const ocupada = !!status;
  const colorAcento = impresa ? gb.orange600 : gb.purple550;

  // Solo mesas libres (sin comanda activa), excluyendo la actual
  const mesasDestino = useMemo(
    () =>
      (mesas ?? []).filter((mesa) => {
        if (mesa.UUID === uuid) return false;
        const tieneComanda = Number(mesa.TIENE_COMANDA_ACTIVA) === 1;
        const estatusOcupada = Number(mesa.ESTATUS) === 1;
        return !tieneComanda && !estatusOcupada;
      }),
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

  const guardarNota = async () => {
    if (!uuid || !onGuardarNota) return;
    try {
      await onGuardarNota(uuid, nota ?? "");
    } catch (e) {
      console.error("Error guardando nota de mesa:", e);
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
      <View
        style={[
          s.mesa,
          ocupada && s.mesaOcupada,
          ocupada && impresa && s.mesaImpresa,
        ]}
      >
        <View
          style={[s.sillaLeft, ocupada && { backgroundColor: colorAcento }]}
        />
        <View
          style={[s.sillaRight, ocupada && { backgroundColor: colorAcento }]}
        />
        <View
          style={[s.sillaTop, ocupada && { backgroundColor: colorAcento }]}
        />
        <View
          style={[s.sillaBottom, ocupada && { backgroundColor: colorAcento }]}
        />
        <View style={s.contenido}>
          <Text style={s.nombre} numberOfLines={1}>
            {nombre}
          </Text>
          {ocupada ? (
            <>
              <Text style={s.ficha} numberOfLines={1}>
                Folio #{ficha ?? id ?? "—"}
              </Text>
              {impresa ? (
                <Text style={s.estadoImpresa}>Cuenta impresa</Text>
              ) : null}
              <TextInput
                style={s.notaInput}
                placeholder="Nota"
                placeholderTextColor={gb.gray400}
                value={nota}
                onChangeText={setNota}
                onBlur={guardarNota}
                onPressIn={(e) => e?.stopPropagation?.()}
                numberOfLines={1}
              />
              <Pressable
                style={[
                  s.cambiarMesa,
                  impresa && { backgroundColor: gb.orange600 },
                ]}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  setCambiarMesa(true);
                }}
                hitSlop={6}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={normalize(12)}
                  color={gb.gray50}
                />
                <Text style={s.cambiarMesaTexto}>Cambiar</Text>
              </Pressable>
            </>
          ) : (
            <Text style={s.estadoLibre}>Libre</Text>
          )}
        </View>
        <Tooltip visible={showTooltip}>{descripcion}</Tooltip>
      </View>

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
            {nombre} · Folio #{ficha ?? id ?? "—"}
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
