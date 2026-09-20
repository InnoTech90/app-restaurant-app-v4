import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import EstatusSincronizado from "../../../components/atoms/EstatusSincronizado/EstatusSincronizado";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { GASTOS_REFRESH_EVENT } from "./events";
import { s } from "./styles";

const ConceptoItem = ({ concepto, onPress, onDelete }) => (
  <Pressable style={s.conceptoItem} onPress={() => onPress(concepto)}>
    <LinearGradient
      style={s.conceptoAccent}
      colors={gb.gradient_blue}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
    <View style={s.conceptoBody}>
      <Text style={s.conceptoNombre}>{concepto.NOMBRE}</Text>
      {!!concepto.DESCRIPCION && (
        <Text style={s.conceptoDesc}>{concepto.DESCRIPCION}</Text>
      )}
      <Text style={s.conceptoRowHint}>Toca para asignar un gasto</Text>
    </View>
    <Pressable
      style={s.conceptoDeleteBtn}
      onPress={() => onDelete(concepto)}
      hitSlop={8}
      accessibilityLabel="Eliminar concepto"
    >
      <Ionicons name="trash-outline" size={normalize(18)} color={gb.red600} />
    </Pressable>
  </Pressable>
);

const Detalle = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const gasto = data ? JSON.parse(data) : {};

  const [conceptos, setConceptos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const res = await Database.getConceptosByCategoria(gasto.UUID);
      setConceptos(res ?? []);
    } catch (e) {
      console.error("Error al cargar conceptos:", e);
    } finally {
      setCargando(false);
    }
  }, [gasto.UUID]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const irAAgregarConcepto = () =>
    router.push({
      pathname: "/Gastos/Agregar",
      params: {
        idCategoria: gasto.UUID,
        nombreCategoria: gasto.NOMBRE,
      },
    });

  const irAAsignarGasto = (concepto) =>
    router.push({
      pathname: "/Gastos/AsignarGasto",
      params: {
        idConcepto: concepto.UUID,
        nombreConcepto: concepto.NOMBRE,
        nombreCategoria: gasto.NOMBRE,
      },
    });

  const eliminarConcepto = (concepto) => {
    Alert.alert(
      "Eliminar concepto",
      `¿Eliminar "${concepto.NOMBRE}"? También se borrarán sus registros de gasto.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await Database.deleteConcepto(concepto.UUID);
              DeviceEventEmitter.emit(GASTOS_REFRESH_EVENT);
              await cargar();
            } catch (e) {
              console.error("Error al eliminar concepto:", e);
              Alert.alert("Error", "No se pudo eliminar el concepto.");
            }
          },
        },
      ],
    );
  };

  const eliminarCategoria = () => {
    if (conceptos.length > 0) {
      Alert.alert(
        "No se puede eliminar",
        `La categoría "${gasto.NOMBRE}" tiene ${conceptos.length} concepto(s). Elimina primero los conceptos.`,
      );
      return;
    }
    Alert.alert(
      "Eliminar categoría",
      `¿Eliminar la categoría "${gasto.NOMBRE}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await Database.deleteCategoria(gasto.UUID);
              DeviceEventEmitter.emit(GASTOS_REFRESH_EVENT);
              router.back();
            } catch (e) {
              if (e?.code === "CATEGORIA_CON_CONCEPTOS") {
                Alert.alert(
                  "No se puede eliminar",
                  e.message ||
                    "La categoría tiene conceptos. Elimínalos primero.",
                );
                return;
              }
              console.error("Error al eliminar categoría:", e);
              Alert.alert("Error", "No se pudo eliminar la categoría.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <Text style={s.headerTitle}>Detalle del gasto</Text>
        <Button style={s.btnAdd} onPress={irAAgregarConcepto}>
          <Ionicons name="add" size={normalize(20)} color="white" />
        </Button>
      </LinearGradient>

      <View style={s.body}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.detalleScroll}
        >
          <Text style={s.sectionLabel}>Categoría</Text>
          <View style={s.detalleCard}>
            <View style={s.detalleTopRow}>
              <Text style={s.detalleNombre}>
                {gasto.NOMBRE ?? "Sin nombre"}
              </Text>
              <View style={s.seccionHeaderActions}>
                <EstatusSincronizado sincronizado={!!gasto.SINCRONIZADO} />
                <Pressable
                  style={s.conceptoDeleteBtn}
                  onPress={eliminarCategoria}
                  hitSlop={8}
                  accessibilityLabel="Eliminar categoría"
                >
                  <Ionicons
                    name="trash-outline"
                    size={normalize(18)}
                    color={gb.red600}
                  />
                </Pressable>
              </View>
            </View>
            {!!gasto.DESCRIPCION && gasto.DESCRIPCION !== "." && (
              <Text style={s.detalleDescripcion}>{gasto.DESCRIPCION}</Text>
            )}
          </View>

          <Text style={[s.sectionLabel, { marginTop: normalize(16) }]}>
            Conceptos ({conceptos.length})
          </Text>

          {cargando ? (
            <ActivityIndicator
              size="small"
              color={gb.blue500}
              style={{ marginTop: normalize(20) }}
            />
          ) : conceptos.length === 0 ? (
            <View style={s.conceptosEmpty}>
              <Ionicons
                name="list-outline"
                size={normalize(36)}
                color={gb.gray300}
              />
              <Text style={s.conceptosEmptyText}>
                Sin conceptos registrados
              </Text>
            </View>
          ) : (
            <View style={s.conceptosList}>
              {conceptos.map((c) => (
                <ConceptoItem
                  key={String(c.ID)}
                  concepto={c}
                  onPress={irAAsignarGasto}
                  onDelete={eliminarConcepto}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Detalle;
