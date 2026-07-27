import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Input from "../../atoms/Input/Input";
import Tooltip from "../../atoms/Tooltip/Tooltip";
import { s } from "./styles";

const Mesa = ({
  id,
  nombre,
  status,
  onPress,
  onLongPress,
  descripcion,
  index = 1,
  mesas,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [cambiarMesa, setCambiarMesa] = useState(false);

  const changeMesa = (idMesaOrigen, idMesaDestino) => {
    // Aquí iría la lógica para cambiar la mesa en la base de datos o estado global
    setCambiarMesa(false);
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
          {/* sillas decorativas */}
          <View style={[s.sillaLeft, { backgroundColor: gb.purple550 }]}></View>
          <View
            style={[s.sillaRight, { backgroundColor: gb.purple550 }]}
          ></View>
          <View style={[s.sillaTop, { backgroundColor: gb.purple550 }]}></View>
          <View
            style={[s.sillaBottom, { backgroundColor: gb.purple550 }]}
          ></View>
          <View style={s.contenido}>
            <Text style={s.nombre}>{nombre} </Text>
            <Text style={s.ficha}>Ficha : {id} </Text>
            <Input placeholder="Nota" style={{ marginTop: 10, width: "80%" }} />
            <Button
              onPress={() => {
                setCambiarMesa(true);
              }}
              style={s.cambiarMesa}
            >
              <Text style={{ color: gb.gray50 }}>Cambiar Mesa</Text>
            </Button>
          </View>
          <Tooltip visible={showTooltip}>{descripcion}</Tooltip>
        </View>
      ) : (
        <View style={s.mesa}>
          {/* sillas decorativas */}
          <View style={s.sillaLeft}></View>
          <View style={s.sillaRight}></View>
          <View style={s.sillaTop}></View>
          <View style={s.sillaBottom}></View>
          <View style={s.contenido}>
            <Text style={s.nombre}>{nombre} </Text>
          </View>
          <Tooltip visible={showTooltip}>{descripcion}</Tooltip>
        </View>
      )}
      <GeneralModal
        visible={cambiarMesa}
        onRequestClose={() => {
          setCambiarMesa(false);
        }}
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
          {mesas.length > 1 ? (
            mesas.map((mesa, i) => {
              if (mesa.ID !== id) {
                return (
                  <View key={mesa.ID}>
                    {mesa.ESTATUS == true ? (
                      <Button
                        style={s.mesaItem}
                        onPress={() => changeMesa(id, mesa.ID)}
                      >
                        <Text style={s.textoMesa}>{mesa.NOMBRE}</Text>
                      </Button>
                    ) : (
                      <View
                        style={[s.mesaItem, { backgroundColor: gb.gray100 }]}
                      >
                        <Text style={[s.textoMesa, { color: gb.gray300 }]}>
                          {mesa.NOMBRE} (Ocupada)
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }
              return null;
            })
          ) : (
            <View style={s.noDataContainer}>
              <Ionicons
                name="alert-circle"
                size={normalize(40)}
                color={gb.gray300}
                style={{ marginBottom: normalize(10) }}
              />
              <Text style={s.textoMesa}>No hay otras mesas disponibles</Text>
              <Text style={s.textoMesaDescripcion}>
                Todas las mesas están ocupadas o no disponibles
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
