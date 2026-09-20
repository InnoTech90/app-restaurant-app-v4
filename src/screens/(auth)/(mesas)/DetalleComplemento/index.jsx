import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import NipModal from "../../../../components/Molecules/NipModal/NipModal";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { useEdicionTicket } from "../../../../utils/useEdicionTicket";
import { gb } from "../../../globalStyles";
import { ComplementosStore } from "../complementosStore";
import { Database } from "./database";
import { s } from "./styles";

const paramToString = (value) => {
  if (value == null) return "";
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value);
};

const leerEstadoInicial = () => {
  const grupos = ComplementosStore.getGruposDisponibles();
  ComplementosStore.clearGruposDisponibles();

  const seleccionRaw = ComplementosStore.getSeleccionInicial();
  ComplementosStore.clearSeleccionInicial();

  const seleccion = {};
  if (seleccionRaw && typeof seleccionRaw === "object") {
    for (const [k, v] of Object.entries(seleccionRaw)) {
      // Solo sí/no: cualquier cantidad > 0 cuenta como seleccionado
      seleccion[String(k)] = Number(v) > 0 ? 1 : 0;
    }
  }

  return {
    grupos: Array.isArray(grupos) ? grupos : [],
    seleccion,
  };
};

/** Aplana grupos → lista de opciones seleccionables (sí/no). */
const aplanarOpciones = (grupos) => {
  const opciones = [];
  for (const grupo of grupos ?? []) {
    const hijos = grupo.complementos || [];
    if (hijos.length > 0) {
      for (const comp of hijos) {
        opciones.push({
          UUID: String(comp.UUID),
          NOMBRE: comp.NOMBRE,
          PRECIO: Number(comp.PRECIO) || 0,
          nombreGrupo: grupo.NOMBRE,
        });
      }
    } else if (grupo.UUID || grupo.ID) {
      // Si el grupo no tiene hijos, el propio grupo es el complemento
      opciones.push({
        UUID: String(grupo.UUID ?? grupo.ID),
        NOMBRE: grupo.NOMBRE,
        PRECIO: Number(grupo.PRECIO) || 0,
        nombreGrupo: "",
      });
    }
  }
  return opciones;
};

const DetalleComplemento = () => {
  const { id_articulo: idArticuloParam, articuloNombre } =
    useLocalSearchParams();
  const idArticulo = paramToString(idArticuloParam).trim();
  const router = useRouter();

  const estadoInicial = useMemo(() => leerEstadoInicial(), []);
  const [gruposComplementos, setGruposComplementos] = useState(
    estadoInicial.grupos,
  );
  const [seleccion, setSeleccion] = useState(estadoInicial.seleccion);
  const [cargando, setCargando] = useState(estadoInicial.grupos.length === 0);
  const [config, setConfig] = useState(null);

  const {
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    confirmarNipEdicion,
  } = useEdicionTicket(config);

  useEffect(() => {
    Database.getConfiguraciones().then(setConfig).catch(console.error);
  }, []);

  useEffect(() => {
    let activa = true;

    const cargar = async () => {
      if (gruposComplementos.length > 0) {
        setCargando(false);
        return;
      }
      if (!idArticulo) {
        setCargando(false);
        return;
      }

      setCargando(true);
      try {
        const grupos = await Database.getComplementos(idArticulo);
        if (activa) setGruposComplementos(grupos ?? []);
      } catch (e) {
        console.error("Error cargando complementos:", e);
        if (activa) setGruposComplementos([]);
      } finally {
        if (activa) setCargando(false);
      }
    };

    cargar();
    return () => {
      activa = false;
    };
  }, [idArticulo]);

  const opciones = useMemo(
    () => aplanarOpciones(gruposComplementos),
    [gruposComplementos],
  );

  const estaSeleccionado = (uuid) => (seleccion[String(uuid)] ?? 0) > 0;

  const toggle = (uuid) => {
    solicitarEdicion(() => {
      setSeleccion((prev) => ({
        ...prev,
        [String(uuid)]: (prev[String(uuid)] ?? 0) > 0 ? 0 : 1,
      }));
    });
  };

  const totalSeleccionados = useMemo(
    () => opciones.filter((o) => estaSeleccionado(o.UUID)).length,
    [opciones, seleccion],
  );

  const handleGuardar = () => {
    solicitarEdicion(() => {
      const complementosSeleccionados = opciones
        .filter((o) => estaSeleccionado(o.UUID))
        .map((o) => ({
          UUID: o.UUID,
          NOMBRE: o.NOMBRE,
          PRECIO: o.PRECIO,
          cantidad: 1,
          nombreGrupo: o.nombreGrupo,
        }));
      ComplementosStore.setSeleccion(complementosSeleccionados);
      router.back();
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} style={s.safeArea}>
      <LinearGradient
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.header}
      >
        <RecoverButton />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={s.headerNombre} numberOfLines={1}>
            {paramToString(articuloNombre) || "Artículo"}
          </Text>
          <Text style={s.headerSubtitulo}>Selecciona complementos</Text>
        </View>
        <View style={{ width: normalize(40) }} />
      </LinearGradient>

      {cargando ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={gb.blue550} />
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {opciones.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: gb.gray400,
                marginTop: 40,
                paddingHorizontal: 24,
              }}
            >
              Este artículo no tiene complementos configurados
            </Text>
          ) : (
            <View style={s.seccion}>
              {opciones.map((opcion, idx) => {
                const seleccionado = estaSeleccionado(opcion.UUID);
                const esUltimo = idx === opciones.length - 1;
                return (
                  <Pressable
                    key={opcion.UUID}
                    style={[
                      s.complementoRow,
                      esUltimo && s.complementoRowUltimo,
                      seleccionado && s.complementoRowSeleccionado,
                    ]}
                    onPress={() => toggle(opcion.UUID)}
                  >
                    <Ionicons
                      name={
                        seleccionado ? "checkmark-circle" : "ellipse-outline"
                      }
                      size={normalize(24)}
                      color={seleccionado ? gb.green500 : gb.gray300}
                      style={{ marginRight: normalize(10) }}
                    />
                    <View style={s.complementoInfo}>
                      <Text style={s.complementoNombre}>{opcion.NOMBRE}</Text>
                      {opcion.PRECIO > 0 && (
                        <Text style={s.complementoPrecio}>
                          +${opcion.PRECIO.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <View style={s.footer}>
        <Button
          gradient={[gb.green500, gb.green400]}
          onPress={handleGuardar}
          styleContainer={s.botonAnadir}
          disabled={cargando}
        >
          <Text style={s.botonAnadirTexto}>
            {totalSeleccionados > 0
              ? `Agregar ${totalSeleccionados} complemento${totalSeleccionados !== 1 ? "s" : ""}`
              : "Continuar sin complementos"}
          </Text>
        </Button>
      </View>

      <NipModal
        visible={modalNipEdicion}
        titulo="Editar ticket"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={confirmarNipEdicion}
        onClose={cerrarNipEdicion}
      />
    </SafeAreaView>
  );
};

export default DetalleComplemento;
