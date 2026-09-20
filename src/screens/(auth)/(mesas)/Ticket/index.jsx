import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import InputCantidad from "../../../../components/atoms/InputCantidad/InputCantidad";
import ModalSinImpresora from "../../../../components/atoms/ModalSinImpresora/ModalSinImpresora";
import MesasNavButtons from "../../../../components/Molecules/MesasNavButtons/MesasNavButtons";
import NipModal from "../../../../components/Molecules/NipModal/NipModal";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import { setAuthHeaderTitulo } from "../../../../utils/authHeaderTitle";
import { useEdicionTicket } from "../../../../utils/useEdicionTicket";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";
import Database from "./database";
import { s } from "./styles";
import { imprimirComanda } from "./ticketTemplate";

const Ticket = () => {
  const router = useRouter();
  const { comanda: comandaRaw, id_mesa: idMesa } = useLocalSearchParams();
  const comandaData = JSON.parse(comandaRaw ?? "null");

  const [articulos, setArticulos] = useState(comandaData?.articulos ?? []);
  const [nota, setNota] = useState(comandaData?.comanda?.NOTA ?? "");
  const [mesa, setMesa] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [modalSinImpresora, setModalSinImpresora] = useState(false);
  const [config, setConfig] = useState(null);

  const comanda = comandaData?.comanda;
  const bloqueada = comanda?.ESTATUS === 4;

  const {
    puedeEditar,
    requiereNipEdicion,
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    confirmarNipEdicion,
    desbloquearEdicion,
  } = useEdicionTicket(config);

  const edicionBloqueada = bloqueada || !puedeEditar;

  useEffect(() => {
    Database.getConfiguraciones().then(setConfig).catch(console.error);
    if (idMesa) Database.getMesa(idMesa).then(setMesa).catch(console.error);
    if (comanda?.ID_CLIENTE)
      Database.getCliente(comanda.ID_CLIENTE)
        .then(setCliente)
        .catch(console.error);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setAuthHeaderTitulo("Comanda");
      if (!comanda?.ID) return;
      let activa = true;
      Database.getArticulosComanda(comanda.ID)
        .then((lista) => {
          if (activa) setArticulos(lista ?? []);
        })
        .catch(console.error);
      return () => {
        activa = false;
      };
    }, [comanda?.ID]),
  );

  const totalProductos = articulos.reduce(
    (acc, r) => acc + (r.CANTIDAD ?? 0),
    0,
  );

  const totalComplemento = (comp) =>
    Number(
      comp.TOTAL ??
        (comp.CANTIDAD ?? 0) *
          (comp.PRECIO_VENTA ??
            comp.COMP_PRECIO ??
            comp.complemento?.PRECIO ??
            0),
    );

  const costoComplementosRenglon = (renglon) =>
    (renglon.complementos ?? []).reduce(
      (acc, c) => acc + totalComplemento(c),
      0,
    );

  const descuentoRenglon = (renglon) => {
    const guardado = Number(renglon.DESCUENTO);
    if (Number.isFinite(guardado) && guardado > 0) return guardado;
    const subtotal =
      Number(renglon.SUBTOTAL) ||
      (renglon.CANTIDAD ?? 0) * (renglon.PRECIO_VENTA ?? 0);
    const costo = costoComplementosRenglon(renglon);
    return Math.max(0, subtotal + costo - (Number(renglon.TOTAL) || 0));
  };

  const totalComanda = articulos.reduce((acc, r) => acc + (r.TOTAL ?? 0), 0);
  const totalDescuentos = articulos.reduce(
    (acc, r) => acc + descuentoRenglon(r),
    0,
  );
  const totalComplementos = articulos.reduce(
    (acc, r) => acc + costoComplementosRenglon(r),
    0,
  );
  const totalBrutoProductos = articulos.reduce(
    (acc, r) =>
      acc +
      (Number(r.SUBTOTAL) ||
        (r.CANTIDAD ?? 0) * (r.PRECIO_VENTA ?? 0)),
    0,
  );

  const comandaPayload = useMemo(
    () => ({
      comanda: comanda
        ? {
            ...comanda,
            NOTA: nota,
            ID_CLIENTE: cliente?.ID ?? comanda.ID_CLIENTE,
          }
        : null,
      articulos,
      totalComanda,
    }),
    [comanda, nota, cliente, articulos, totalComanda],
  );

  const irClientes = () => {
    setAuthHeaderTitulo("Clientes");
    router.replace({
      pathname: "/Menu Principal",
      params: { id_mesa: idMesa, abrirCliente: "1" },
    });
  };

  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;

    const raw = String(fechaStr).trim();
    const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");

    // SQLite CURRENT_TIMESTAMP guarda en UTC sin zona explícita.
    const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(
      normalizada,
    );
    const iso = sinZona ? `${normalizada}Z` : normalizada;

    const fecha = new Date(iso);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return { fecha: "—", hora: "—" };

    const fecha = parseFechaLocal(fechaStr);
    if (!fecha) {
      const [fechaRaw, horaRaw] = String(fechaStr).split(" ");
      return { fecha: fechaRaw ?? "—", hora: horaRaw?.slice(0, 5) ?? "—" };
    }

    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();
    const hh = String(fecha.getHours()).padStart(2, "0");
    const min = String(fecha.getMinutes()).padStart(2, "0");
    return { fecha: `${dd}/${mm}/${yyyy}`, hora: `${hh}:${min}` };
  };
  const { fecha, hora } = formatearFecha(comanda?.FECHA);

  const handleCancelar = () => {
    solicitarEdicion(() => {
      Alert.alert(
        "Cancelar comanda",
        "¿Estás seguro de que deseas cancelar esta comanda? Esta acción no se puede deshacer.",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí, cancelar",
            style: "destructive",
            onPress: async () => {
              if (cancelando || !comanda) return;
              setCancelando(true);
              try {
                await Database.cancelarComanda(comanda.ID);
                router.replace("/Inicio");
              } catch (e) {
                console.error("Error cancelando comanda:", e);
                setCancelando(false);
              }
            },
          },
        ],
      );
    });
  };

  const handleCambiarCantidad = (renglon, nuevaCantidad) => {
    solicitarEdicion(async () => {
      try {
        const tipo =
          nuevaCantidad > renglon.CANTIDAD
            ? "INCREMENTAR_ARTICULO"
            : "DISMINUIR_ARTICULO";
        const costoComps = costoComplementosRenglon(renglon);
        const descuento = descuentoRenglon(renglon);
        const nuevoSubtotal = nuevaCantidad * (renglon.PRECIO_VENTA ?? 0);
        const nuevoTotal = Math.max(0, nuevoSubtotal - descuento + costoComps);

        await Database.actualizarCantidadArticulo(
          renglon.ID,
          nuevaCantidad,
          renglon.PRECIO_VENTA,
          {
            subtotal: nuevoSubtotal,
            total: nuevoTotal,
            descuento,
          },
        );
        await Database.registrarMovimiento(
          renglon.ID_COMANDA,
          renglon.ID_ARTICULO,
          tipo,
        );
        setArticulos((prev) =>
          prev.map((r) =>
            r.ID === renglon.ID
              ? {
                  ...r,
                  CANTIDAD: nuevaCantidad,
                  SUBTOTAL: nuevoSubtotal,
                  TOTAL: nuevoTotal,
                  DESCUENTO: descuento,
                }
              : r,
          ),
        );
      } catch (e) {
        console.error("Error actualizando cantidad:", e);
      }
    });
  };

  const handleEliminarArticulo = (renglon) => {
    solicitarEdicion(() => {
      Alert.alert(
        "Eliminar artículo",
        `¿Eliminar "${renglon.articulo?.NOMBRE ?? "este artículo"}" de la comanda?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await Database.registrarMovimiento(
                  renglon.ID_COMANDA,
                  renglon.ID_ARTICULO,
                  "ELIMINACION_ARTICULO",
                );
                await Database.eliminarArticulo(renglon.ID);
                setArticulos((prev) => prev.filter((r) => r.ID !== renglon.ID));
              } catch (e) {
                console.error("Error eliminando artículo:", e);
              }
            },
          },
        ],
      );
    });
  };

  const handleNotaBlur = () => {
    if (!comanda) return;
    solicitarEdicion(async () => {
      try {
        await Database.actualizarNota(comanda.ID, nota);
      } catch (e) {
        console.error("Error guardando nota:", e);
      }
    });
  };

  const handleNotaChange = (texto) => {
    if (edicionBloqueada) {
      if (requiereNipEdicion && !bloqueada) desbloquearEdicion();
      return;
    }
    setNota(texto);
  };

  const handleImprimir = async () => {
    if (imprimiendo || !comanda) return;
    setImprimiendo(true);
    try {
      // sinPrecios=true: ticket de cocina/barra, nunca mostrar precios
      const resultado = await imprimirComanda(comanda, articulos, mesa, true);
      if (resultado === "SIN_IMPRESORA") {
        setModalSinImpresora(true);
        return;
      }
      await Database.imprimirTicket(comanda.ID);
      await Database.registrarMovimiento(comanda.ID, null, "IMPRESION_TICKET");
    } catch (e) {
      console.error("Error imprimiendo ticket:", e);
    } finally {
      setImprimiendo(false);
    }
  };

  const nombreComplemento = (comp) =>
    comp.complemento?.NOMBRE ??
    comp.COMP_NOMBRE ??
    comp.NOTA ??
    comp.NOMBRE ??
    "—";

  const handleEditarArticulo = (renglon) => {
    if (!renglon?.articulo && !renglon?.ID_ARTICULO) return;
    if (edicionBloqueada) {
      if (requiereNipEdicion && !bloqueada) desbloquearEdicion();
      return;
    }
    solicitarEdicion(() => {
      router.push({
        pathname: "/DetalleArticulo",
        params: {
          id_mesa: idMesa,
          modo: "editar",
          id_comanda_articulo: String(renglon.ID),
          id_articulo: String(
            renglon.articulo?.UUID ?? renglon.ID_ARTICULO ?? "",
          ),
        },
      });
    });
  };

  const renderArticulo = ({ item: renglon, index: idx }) => {
    const comps = renglon.complementos ?? [];
    const descuento = descuentoRenglon(renglon);
    const tieneAjustes =
      comps.length > 0 || descuento > 0 || !!renglon.NOTA?.trim();

    return (
    <View style={[s.articuloCard, idx !== 0 && s.articuloRowBorder]}>
      <View style={s.articuloRow}>
        <Pressable
          style={s.articuloInfo}
          onPress={() => handleEditarArticulo(renglon)}
        >
          <Text style={s.articuloNombre} numberOfLines={2}>
            {renglon.articulo?.NOMBRE ?? "—"}
          </Text>
          <View style={s.articuloMeta}>
            <Text style={s.articuloPrecio}>
              ${(renglon.PRECIO_VENTA ?? 0).toFixed(2)} c/u
            </Text>
            <Text style={s.articuloEditarHint}> · Editar</Text>
          </View>
        </Pressable>
        <InputCantidad
          value={renglon.CANTIDAD}
          onChange={(val) => handleCambiarCantidad(renglon, val)}
          min={1}
          small
          disabled={edicionBloqueada}
          style={s.inputCantidad}
        />
        <Text style={s.articuloTotal}>${(renglon.TOTAL ?? 0).toFixed(2)}</Text>
        <Button
          style={s.btnEliminar}
          styleContainer={s.btnEliminarContainer}
          onPress={() => handleEliminarArticulo(renglon)}
          disabled={edicionBloqueada}
        >
          <Ionicons
            name="trash-outline"
            size={normalize(14)}
            color={edicionBloqueada ? gb.gray400 : gb.red600}
          />
        </Button>
      </View>

      {tieneAjustes && (
        <Pressable
          style={s.ajustesLista}
          onPress={() => handleEditarArticulo(renglon)}
        >
          {comps.length > 0 && (
            <View style={s.ajusteBloque}>
              <Text style={s.ajustesTitulo}>Complementos</Text>
              {comps.map((comp, i) => (
                <View
                  key={`${renglon.ID}-comp-${comp.ID ?? comp.ID_COMPLEMENTO ?? i}`}
                  style={s.ajusteRow}
                >
                  <Text style={s.ajusteBullet}>↳</Text>
                  <Text style={s.ajusteNombre} numberOfLines={1}>
                    {nombreComplemento(comp)}
                  </Text>
                  {totalComplemento(comp) > 0 && (
                    <Text style={s.ajustePrecioPos}>
                      +${totalComplemento(comp).toFixed(2)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {descuento > 0 && (
            <View style={s.ajusteBloque}>
              <Text style={s.ajustesTitulo}>Descuento</Text>
              <View style={s.ajusteRow}>
                <Text style={s.ajusteBullet}>↳</Text>
                <Text style={s.ajusteNombre}>Descuento aplicado</Text>
                <Text style={s.ajustePrecioNeg}>
                  -${descuento.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {!!renglon.NOTA?.trim() && (
            <View style={[s.ajusteBloque, s.notaPedido]}>
              <Ionicons
                name="document-text-outline"
                size={normalize(13)}
                color={gb.blue550}
              />
              <Text style={s.notaPedidoTexto} numberOfLines={2}>
                Nota: {renglon.NOTA}
              </Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={s.root}>
      <ModalSinImpresora
        visible={modalSinImpresora}
        onOmitir={() => setModalSinImpresora(false)}
        onVincular={() => {
          setModalSinImpresora(false);
          router.push("/(auth)/Impresoras");
        }}
      />
      {/* ── HEADER ── */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <View style={s.headerCenter}>
          <Text style={s.headerMesa}>{mesa?.NOMBRE ?? "Mesa"}</Text>
          <Text style={s.headerSub}>
            Folio #{comanda?.FICHA ?? "—"} · {fecha} {hora}
          </Text>
        </View>
        <Button
          style={s.btnCancelar}
          styleContainer={s.btnCancelarContainer}
          onPress={handleCancelar}
          disabled={cancelando}
        >
          <Ionicons
            name="trash-outline"
            size={normalize(15)}
            color={gb.gray50}
          />
        </Button>
      </LinearGradient>

      {/* ── CLIENTE CHIP (solo si hay) ── */}
      {cliente && (
        <View style={s.clienteStrip}>
          <Ionicons
            name="person-circle-outline"
            size={normalize(16)}
            color={gb.green500}
          />
          <Text style={s.clienteNombre}>{cliente.NOMBRE}</Text>
          {!!cliente.TELEFONO && (
            <Text style={s.clienteTelefono}>{cliente.TELEFONO}</Text>
          )}
        </View>
      )}

      {/* ── BANNER BLOQUEADO ── */}
      {bloqueada && (
        <View
          style={{
            backgroundColor: gb.orange100 ?? "#FFF3CD",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: normalize(14),
            paddingVertical: normalize(8),
            gap: normalize(8),
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={normalize(16)}
            color={gb.orange600 ?? "#856404"}
          />
          <Text
            style={{
              fontSize: normalize(12),
              color: gb.orange600 ?? "#856404",
              fontWeight: "600",
            }}
          >
            Cuenta impresa — ve a Pago para confirmar o editar
          </Text>
        </View>
      )}

      {!bloqueada && requiereNipEdicion && !puedeEditar && (
        <View
          style={{
            backgroundColor: gb.red100 ?? "#FDECEC",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: normalize(14),
            paddingVertical: normalize(8),
            gap: normalize(8),
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: normalize(8) }}>
            <Ionicons
              name="lock-closed-outline"
              size={normalize(16)}
              color={gb.red600}
            />
            <Text
              style={{
                flex: 1,
                fontSize: normalize(12),
                color: gb.red600,
                fontWeight: "600",
              }}
            >
              Edición protegida — ingresa tu NIP para modificar el ticket
            </Text>
          </View>
          <Button onPress={desbloquearEdicion} style={{ paddingHorizontal: normalize(10), paddingVertical: normalize(6) }}>
            <Text style={{ color: gb.gray50, fontSize: normalize(11), fontWeight: "700" }}>
              Desbloquear
            </Text>
          </Button>
        </View>
      )}

      {/* ── LISTA ARTÍCULOS (único scroll) ── */}
      <FlatList
        data={articulos}
        keyExtractor={(item) => String(item.ID)}
        style={s.lista}
        contentContainerStyle={s.listaContent}
        ListHeaderComponent={
          <View style={s.listaHeader}>
            <Text style={s.listaHeaderTexto}>Artículo</Text>
            <Text style={s.listaHeaderTexto}>Cant.</Text>
            <Text style={s.listaHeaderTexto}>Total</Text>
            <View style={{ width: normalize(34) }} />
          </View>
        }
        ListEmptyComponent={
          <Text style={s.vacio}>Sin artículos en esta comanda</Text>
        }
        renderItem={renderArticulo}
      />

      {/* ── FOOTER FIJO ── */}
      <View style={s.footer}>
        {/* Nota */}
        <TextInput
          style={s.notasInput}
          multiline
          numberOfLines={2}
          placeholder="Nota de la mesa..."
          placeholderTextColor={gb.gray400}
          value={nota}
          onChangeText={handleNotaChange}
          onBlur={handleNotaBlur}
          textAlignVertical="top"
          editable={!edicionBloqueada}
        />

        {/* Botón imprimir */}
        <Button
          styleContainer={s.btnImprimirContainer}
          style={s.btnImprimir}
          gradient={bloqueada ? [gb.gray300, gb.gray200] : gb.gradient_blue}
          onPress={handleImprimir}
          disabled={imprimiendo || bloqueada}
        >
          <Ionicons
            name="print-outline"
            size={normalize(20)}
            color={bloqueada ? gb.gray500 : gb.gray50}
          />
          <Text
            style={[s.btnImprimirTexto, bloqueada && { color: gb.gray500 }]}
          >
            {imprimiendo ? "Imprimiendo..." : "Imprimir preparación"}
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

      <MesasNavButtons
        tabActiva="comanda"
        idMesa={idMesa}
        comandaPayload={comandaPayload}
        tieneCliente={!!(cliente?.ID ?? comanda?.ID_CLIENTE)}
        onPressCliente={irClientes}
      />
    </SafeAreaView>
  );
};

export default Ticket;
