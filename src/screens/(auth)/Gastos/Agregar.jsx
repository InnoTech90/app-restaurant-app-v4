import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../../components/atoms/Input/Input";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { GASTOS_REFRESH_EVENT } from "./events";
import { s } from "./styles";

const paramStr = (value) => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : "";
  return value != null ? String(value) : "";
};

/** Paso 1: categoría | Paso 2: concepto (sin monto) */
const AgregarGasto = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const idCategoria = paramStr(params.idCategoria);
  const nombreCategoria = paramStr(params.nombreCategoria);
  const esConcepto = !!idCategoria;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim()) {
      Alert.alert(
        "Campo requerido",
        esConcepto
          ? "Ingresa el nombre del concepto."
          : "Ingresa el nombre de la categoría.",
      );
      return;
    }
    try {
      setGuardando(true);
      if (esConcepto) {
        await Database.insertConcepto({
          idCategoria,
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
        });
      } else {
        await Database.insertCategoria({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
        });
      }
      DeviceEventEmitter.emit(GASTOS_REFRESH_EVENT);
      router.back();
    } catch (e) {
      console.error("Error al guardar:", e);
      Alert.alert(
        "Error",
        esConcepto
          ? "No se pudo guardar el concepto."
          : "No se pudo guardar la categoría.",
      );
    } finally {
      setGuardando(false);
    }
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
        <Text style={s.headerTitle}>
          {esConcepto ? "Nuevo concepto" : "Nueva categoría"}
        </Text>
        <View style={{ width: normalize(35) }} />
      </LinearGradient>

      <View style={s.body}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
        >
          {esConcepto && (
            <View style={s.categoriaHint}>
              <Ionicons
                name="folder-outline"
                size={normalize(16)}
                color={gb.purple800}
              />
              <Text style={s.categoriaHintText} numberOfLines={1}>
                {nombreCategoria || "Categoría"}
              </Text>
            </View>
          )}

          <Text style={s.sectionLabel}>
            {esConcepto ? "Paso 2 · Concepto" : "Paso 1 · Categoría"}
          </Text>
          <Input
            label="Nombre *"
            placeholder={
              esConcepto
                ? "Ej. Luz, Agua, Internet…"
                : "Ej. Servicios, Nómina, Renta…"
            }
            icon="pricetag-outline"
            iconColor={gb.purple550}
            value={nombre}
            onChange={setNombre}
          />
          <Input
            label="Descripción"
            placeholder="Descripción breve (opcional)"
            icon="document-text-outline"
            value={descripcion}
            onChange={setDescripcion}
          />

          <View style={s.saveBtn}>
            <LinearGradient
              colors={gb.gradient_blue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={s.saveBtnInner}
                onPress={guardar}
                disabled={guardando}
              >
                <Ionicons
                  name={
                    guardando
                      ? "hourglass-outline"
                      : "checkmark-circle-outline"
                  }
                  size={normalize(20)}
                  color="white"
                />
                <Text style={s.saveBtnText}>
                  {guardando
                    ? "Guardando…"
                    : esConcepto
                      ? "Crear concepto"
                      : "Crear categoría"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AgregarGasto;
