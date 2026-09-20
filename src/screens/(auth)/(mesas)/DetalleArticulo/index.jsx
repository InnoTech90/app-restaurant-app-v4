import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import InputCantidad from "../../../../components/atoms/InputCantidad/InputCantidad";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import NipModal from "../../../../components/Molecules/NipModal/NipModal";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { useEdicionTicket } from "../../../../utils/useEdicionTicket";
import { gb } from "../../../globalStyles";
import { ComplementosStore } from "../complementosStore";
import { Database } from "./database";
import { s } from "./styles";

const DetalleArticulo = () => {
  const {
    articulo: articuloRaw,
    id_mesa: idMesa,
    modo,
    id_comanda_articulo: idComandaArticulo,
    id_articulo: idArticuloParam,
  } = useLocalSearchParams();

  const esEdicion = modo === "editar" && !!idComandaArticulo;
  const router = useRouter();
  const cargadoRef = useRef(false);

  const articuloParam = useMemo(() => {
    if (!articuloRaw) return null;
    try {
      return typeof articuloRaw === "string"
        ? JSON.parse(articuloRaw)
        : articuloRaw;
    } catch {
      return null;
    }
  }, [articuloRaw]);

  const [articulo, setArticulo] = useState(articuloParam);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [descuentoPct, setDescuentoPct] = useState("");
  const [descuentoMonto, setDescuentoMonto] = useState("");
  const [tieneGruposComplementos, setTieneGruposComplementos] = useState(false);
  const [gruposComplementos, setGruposComplementos] = useState([]);
  const [complementosSeleccionados, setComplementosSeleccionados] = useState(
    [],
  );
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
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

  const idArticulo = String(
    idArticuloParam || articulo?.UUID || articuloParam?.UUID || "",
  );
  const precioBase = Number(articulo?.PRECIO ?? 0) || 0;

  // Al volver de DetalleComplemento, aplicar selección
  useFocusEffect(
    useCallback(() => {
      const seleccion = ComplementosStore.getSeleccion();
      if (seleccion !== null) {
        setComplementosSeleccionados(
          (seleccion || []).map((c) => ({
            UUID: String(c.UUID),
            NOMBRE: c.NOMBRE,
            PRECIO: Number(c.PRECIO) || 0,
            cantidad: Number(c.cantidad) || 1,
            nombreGrupo: c.nombreGrupo ?? "",
          })),
        );
        ComplementosStore.clear();
      }
    }, []),
  );

  useEffect(() => {
    let activa = true;
    cargadoRef.current = false;

    const cargar = async () => {
      setCargando(true);
      try {
        let articuloActual = articuloParam;
        let comps = [];
        let cantidadInicial = 1;
        let notasInicial = "";
        let subtotalGuardado = null;
        let totalGuardado = null;
        let descuentoGuardado = null;
        let idArticuloComanda = null;

        if (esEdicion) {
          const data = await Database.getComandaArticuloCompleto(
            Number(idComandaArticulo),
          );
          if (!activa) return;
          if (data?.articulo) articuloActual = data.articulo;
          if (data?.renglon) {
            cantidadInicial = Number(data.renglon.CANTIDAD) || 1;
            notasInicial = data.renglon.NOTA ?? "";
            subtotalGuardado = Number(data.renglon.SUBTOTAL) || 0;
            totalGuardado = Number(data.renglon.TOTAL) || 0;
            descuentoGuardado = Number(data.renglon.DESCUENTO);
            idArticuloComanda = data.renglon.ID_ARTICULO ?? null;
          }
          comps = (data?.complementos ?? []).map((c) => ({
            UUID: String(c.UUID),
            NOMBRE: c.NOMBRE,
            PRECIO: Number(c.PRECIO) || 0,
            cantidad: Number(c.cantidad) || 1,
          }));
        }

        const idArt = String(
          idArticuloParam ||
            idArticuloComanda ||
            articuloActual?.UUID ||
            articuloActual?.ID ||
            "",
        ).trim();
        const grupos = idArt ? await Database.getComplementos(idArt) : [];
        if (!activa) return;

        setArticulo(articuloActual);
        setCantidad(cantidadInicial);
        setNotas(notasInicial);
        setComplementosSeleccionados(comps);
        setGruposComplementos(grupos ?? []);
        setTieneGruposComplementos((grupos ?? []).length > 0);

        if (esEdicion && subtotalGuardado != null && totalGuardado != null) {
          const costo = comps.reduce(
            (acc, c) => acc + (c.PRECIO || 0) * (c.cantidad || 0),
            0,
          );
          const desc =
            Number.isFinite(descuentoGuardado) && descuentoGuardado > 0
              ? descuentoGuardado
              : Math.max(0, subtotalGuardado + costo - totalGuardado);
          if (desc > 0) {
            setDescuentoMonto(desc.toFixed(2));
            setDescuentoPct(
              subtotalGuardado > 0
                ? ((desc / subtotalGuardado) * 100).toFixed(2)
                : "",
            );
          }
        }

        cargadoRef.current = true;
      } catch (e) {
        console.error("Error cargando detalle artículo:", e);
      } finally {
        if (activa) setCargando(false);
      }
    };

    cargar();
    return () => {
      activa = false;
    };
  }, [esEdicion, idComandaArticulo, idArticuloParam, articuloRaw]);

  const totalBruto = precioBase * cantidad;

  const onChangePct = (val) => {
    let num = val.replace(/[^0-9.]/g, "");
    if (num === "" || isNaN(parseFloat(num))) {
      setDescuentoPct("");
      setDescuentoMonto("");
      return;
    }
    let pct = parseFloat(num);
    if (pct > 100) {
      pct = 100;
      num = "100";
    }
    setDescuentoPct(num);
    setDescuentoMonto(((totalBruto * pct) / 100).toFixed(2));
  };

  const onChangeMonto = (val) => {
    let num = val.replace(/[^0-9.]/g, "");
    if (num === "" || isNaN(parseFloat(num))) {
      setDescuentoMonto("");
      setDescuentoPct("");
      return;
    }
    let monto = parseFloat(num);
    if (totalBruto > 0 && monto > totalBruto) {
      monto = totalBruto;
      num = totalBruto.toFixed(2);
    }
    setDescuentoMonto(num);
    setDescuentoPct(
      totalBruto > 0 ? Math.min(100, (monto / totalBruto) * 100).toFixed(2) : "",
    );
  };

  const descuento = useMemo(() => {
    const d = parseFloat(descuentoMonto);
    if (isNaN(d)) return 0;
    return Math.min(d, totalBruto);
  }, [descuentoMonto, totalBruto]);

  const costoComplementos = useMemo(
    () =>
      complementosSeleccionados.reduce(
        (acc, c) => acc + (c.PRECIO || 0) * (c.cantidad || 0),
        0,
      ),
    [complementosSeleccionados],
  );

  const total = totalBruto - descuento + costoComplementos;

  const abrirComplementos = () => {
    solicitarEdicion(async () => {
      const id = String(
        idArticuloParam || articulo?.UUID || articulo?.ID || "",
      ).trim();
      if (!id && gruposComplementos.length === 0) return;

      const seleccionInicial = Object.fromEntries(
        complementosSeleccionados
          .filter((c) => c.UUID)
          .map((c) => [String(c.UUID), Number(c.cantidad) || 0]),
      );
      ComplementosStore.setSeleccionInicial(seleccionInicial);

      let grupos = gruposComplementos;
      if (!grupos?.length && id) {
        try {
          grupos = await Database.getComplementos(id);
          setGruposComplementos(grupos ?? []);
          setTieneGruposComplementos((grupos ?? []).length > 0);
        } catch (e) {
          console.error("Error recargando complementos:", e);
          grupos = [];
        }
      }
      ComplementosStore.setGruposDisponibles(grupos ?? []);

      router.push({
        pathname: "/DetalleComplemento",
        params: {
          id_articulo: id,
          articuloNombre: articulo?.NOMBRE ?? "",
        },
      });
    });
  };

  const payloadArticulo = () => ({
    ID_ARTICULO: articulo.UUID,
    CANTIDAD: cantidad,
    PRECIO_VENTA: precioBase,
    NOTA: notas,
    DESCUENTO: descuento,
    SUBTOTAL: totalBruto,
    TOTAL: total,
    complementos: complementosSeleccionados.map((c) => ({
      ID_COMPLEMENTO: c.UUID,
      CANTIDAD: c.cantidad || 1,
      PRECIO_VENTA: c.PRECIO || 0,
      NOTA: c.NOMBRE ?? "",
      SUBTOTAL: (c.PRECIO || 0) * (c.cantidad || 1),
      TOTAL: (c.PRECIO || 0) * (c.cantidad || 1),
    })),
  });

  const handleGuardar = () => {
    if (guardando || !articulo) return;
    solicitarEdicion(async () => {
      setGuardando(true);
      try {
        if (esEdicion) {
          await Database.updateComandaArticulo(
            Number(idComandaArticulo),
            payloadArticulo(),
          );
        } else {
          await Database.insertComanda({
            id_mesa: idMesa,
            nota: "",
            articulos: [payloadArticulo()],
          });
        }
        router.back();
      } catch (err) {
        console.error("Error guardando comanda:", err);
      } finally {
        setGuardando(false);
      }
    });
  };

  const handleCambiarCantidad = (val) => {
    solicitarEdicion(() => setCantidad(val));
  };

  const autorizarEdicion = () => {
    solicitarEdicion(() => {});
  };

  if (cargando) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 1,
          backgroundColor: gb.gray50,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={gb.blue550} size="large" />
      </SafeAreaView>
    );
  }

  if (!articulo) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: "black" }}
      >
        <Text>Sin artículo</Text>
      </SafeAreaView>
    );
  }

  const mostrarComplementos =
    tieneGruposComplementos || complementosSeleccionados.length > 0 || !!idArticulo;

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
      <LinearGradient
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.header}
      >
        <RecoverButton />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={s.headerNombre} numberOfLines={1}>
            {articulo.NOMBRE}
          </Text>
          <Text style={s.headerPrecioBase}>
            ${Number(precioBase).toFixed(2)} por unidad
          </Text>
        </View>
        <View style={{ width: normalize(40) }} />
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Notas de cocina</Text>
          <TextInput
            style={s.textArea}
            placeholder="Ej: sin sal, término medio..."
            placeholderTextColor={gb.gray400}
            value={notas}
            onChangeText={setNotas}
            onFocus={autorizarEdicion}
            multiline
            numberOfLines={3}
          />
        </View>

        {mostrarComplementos && (
          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>Complementos</Text>
            <Pressable style={s.botonComplementos} onPress={abrirComplementos}>
              <Ionicons
                name="add-circle-outline"
                size={normalize(20)}
                color={gb.blue550}
              />
              <Text style={s.botonComplementosTexto}>
                {complementosSeleccionados.length > 0
                  ? `${complementosSeleccionados.length} complemento${complementosSeleccionados.length !== 1 ? "s" : ""} · Editar`
                  : "+ Seleccionar complementos"}
              </Text>
            </Pressable>

            {complementosSeleccionados.map((comp) => (
              <View key={comp.UUID} style={s.resumenFila}>
                <Text style={s.resumenTextoIzq}>
                  {comp.NOMBRE} ×{comp.cantidad}
                </Text>
                <Text style={[s.resumenTextoDer, { color: gb.green600 }]}>
                  +${((comp.PRECIO || 0) * comp.cantidad).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Cantidad</Text>
          <View style={s.cantidadRow}>
            <Text style={s.cantidadLabel}>Unidades</Text>
            <InputCantidad
              value={cantidad}
              onChange={handleCambiarCantidad}
              style={s.inputCantidad}
            />
          </View>
        </View>

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Descuento</Text>
          <View style={s.descuentoRow}>
            <View style={s.descuentoItem}>
              <Text style={s.descuentoLabel}>Porcentaje (%)</Text>
              <TextInput
                style={s.descuentoInput}
                placeholder="0.00"
                placeholderTextColor={gb.gray400}
                value={descuentoPct}
                onChangeText={onChangePct}
                onFocus={autorizarEdicion}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={s.descuentoItem}>
              <Text style={s.descuentoLabel}>Monto ($)</Text>
              <TextInput
                style={s.descuentoInput}
                placeholder="0.00"
                placeholderTextColor={gb.gray400}
                value={descuentoMonto}
                onChangeText={onChangeMonto}
                onFocus={autorizarEdicion}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Resumen</Text>
          <View style={s.resumenFila}>
            <Text style={s.resumenTextoIzq}>
              {articulo.NOMBRE} ×{cantidad}
            </Text>
            <Text style={s.resumenTextoDer}>${totalBruto.toFixed(2)}</Text>
          </View>

          {complementosSeleccionados.map((comp) => (
            <View key={`res-${comp.UUID}`} style={s.resumenFila}>
              <Text style={s.resumenTextoIzq}>
                {comp.NOMBRE} ×{comp.cantidad}
              </Text>
              <Text style={[s.resumenTextoDer, { color: gb.green600 }]}>
                +${((comp.PRECIO || 0) * comp.cantidad).toFixed(2)}
              </Text>
            </View>
          ))}

          {descuento > 0 && (
            <View style={s.resumenFila}>
              <Text style={s.resumenTextoIzq}>Descuento</Text>
              <Text style={[s.resumenTextoDer, { color: gb.red600 }]}>
                -${descuento.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={s.resumenDivider} />

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValor}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Button
          gradient={guardando ? [gb.gray300, gb.gray400] : gb.gradient_blue}
          onPress={handleGuardar}
          styleContainer={s.botonAgregar}
          disabled={guardando}
        >
          <Text style={s.botonAgregarTexto}>
            {guardando
              ? "Guardando..."
              : esEdicion
                ? `Guardar cambios · $${total.toFixed(2)}`
                : `Agregar al pedido · $${total.toFixed(2)}`}
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

export default DetalleArticulo;
