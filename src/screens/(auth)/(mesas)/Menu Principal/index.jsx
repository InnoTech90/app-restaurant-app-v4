import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../../components/Molecules/Card/Card";
import CardArticulo from "../../../../components/Molecules/CardArticulo/CardArticulo";
import MesasNavButtons from "../../../../components/Molecules/MesasNavButtons/MesasNavButtons";
import Buscador from "../../../../components/atoms/Buscador/Buscador";
import Button from "../../../../components/atoms/Button/Button";
import GeneralModal from "../../../../components/atoms/GeneralModal/GeneralModal";
import Input from "../../../../components/atoms/Input/Input";
import Loading from "../../../../components/atoms/Loading/Loading";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import Select from "../../../../components/atoms/Select/Select";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import {
  setAuthHeaderTitulo,
} from "../../../../utils/authHeaderTitle";
import { useEdicionTicket } from "../../../../utils/useEdicionTicket";
import NipModal from "../../../../components/Molecules/NipModal/NipModal";
import { gb } from "../../../globalStyles";
import Database from "./database";
import { s } from "./styles";

const MenuPrincipal = () => {
  const [grupos, setGrupos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [comandaActiva, setComandaActiva] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [buscadorCliente, setBuscadorCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [tabActiva, setTabActiva] = useState("menu"); // menu | comanda | cliente
  const [vistaCliente, setVistaCliente] = useState("lista"); // lista | form
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formNombre, setFormNombre] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formDireccion, setFormDireccion] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [config, setConfig] = useState(null);
  const navigationLockRef = useRef(false);
  const router = useRouter();
  const { id_mesa: idMesa, abrirCliente } = useLocalSearchParams();

  const {
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    confirmarNipEdicion,
  } = useEdicionTicket(config);

  useEffect(() => {
    cargarMenu();
    Database.getConfiguraciones().then(setConfig).catch(console.error);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTabActiva(abrirCliente === "1" ? "cliente" : "menu");
      setAuthHeaderTitulo(abrirCliente === "1" ? "Clientes" : "Menu");
      if (!idMesa) return;

      let activa = true;

      const cargar = async () => {
        try {
          navigationLockRef.current = false;
          const [comandaActualizada, mesaDb] = await Promise.all([
            Database.getComandaCompleta(idMesa),
            Database.getMesa(idMesa),
          ]);
          if (!activa) return;

          setComandaActiva(comandaActualizada);
          setMesa(mesaDb ?? null);

          const idCliente = comandaActualizada?.comanda?.ID_CLIENTE ?? null;
          if (!idCliente) {
            setClienteSeleccionado(null);
          } else {
            const clienteActualizado = await Database.getCliente(idCliente);
            if (!activa) return;
            setClienteSeleccionado(clienteActualizado);
          }

          if (abrirCliente === "1" && activa) {
            const lista = await Database.getClientes().catch(() => []);
            if (!activa) return;
            setClientes(lista ?? []);
            setBuscadorCliente("");
            setVistaCliente("lista");
            setClienteEditando(null);
            setModalCliente(true);
          }
        } catch (error) {
          if (activa) console.error("Error cargando comanda:", error);
        }
      };

      cargar();

      return () => {
        activa = false;
      };
    }, [idMesa, abrirCliente]),
  );

  const cargarMenu = async () => {
    try {
      const { grupos, articulos } = await Database.getMenu();

      console.log(
        `✅ Menú cargado: ${grupos.length} grupos, ${articulos.length} artículos`,
      );

      setGrupos(grupos);
      setArticulos(articulos);
    } catch (e) {
      console.error("Error cargando menú:", e);
    } finally {
      setCargando(false);
    }
  };

  const datosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return grupos
      .filter((g) => grupoSeleccionado === null || g.UUID === grupoSeleccionado)
      .map((g) => ({
        ...g,
        articulos: articulos.filter((a) => {
          if (a.ID_GRUPO !== g.UUID) return false;
          if (!texto) return true;
          return (
            a.NOMBRE?.toLowerCase().includes(texto) ||
            a.NOMBRE_CORTO?.toLowerCase().includes(texto)
          );
        }),
      }))
      .filter((g) => g.articulos.length > 0);
  }, [grupos, articulos, busqueda, grupoSeleccionado]);

  const clientesFiltrados = useMemo(() => {
    const texto = buscadorCliente.trim().toLowerCase();
    if (!texto) return clientes;
    return clientes.filter(
      (c) =>
        c.NOMBRE?.toLowerCase().includes(texto) ||
        c.TELEFONO?.toLowerCase().includes(texto),
    );
  }, [clientes, buscadorCliente]);

  const sincronizarTituloHeader = (tab) => {
    if (tab === "cliente") setAuthHeaderTitulo("Clientes");
    else if (tab === "comanda") setAuthHeaderTitulo("Comanda");
    else if (tab === "pagar") setAuthHeaderTitulo("Pagar");
    else setAuthHeaderTitulo("Menu");
  };

  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    const raw = String(fechaStr).trim();
    const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");
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

  const { fecha: fechaComanda, hora: horaComanda } = formatearFecha(
    comandaActiva?.comanda?.FECHA,
  );

  const abrirModalCliente = async () => {
    setTabActiva("cliente");
    sincronizarTituloHeader("cliente");
    setVistaCliente("lista");
    setClienteEditando(null);
    const lista = await Database.getClientes().catch(() => []);
    setClientes(lista ?? []);
    setBuscadorCliente("");
    setModalCliente(true);
  };

  const resetFormCliente = () => {
    setFormNombre("");
    setFormTelefono("");
    setFormCorreo("");
    setFormDireccion("");
    setFormDescripcion("");
    setClienteEditando(null);
  };

  const abrirFormNuevoCliente = () => {
    resetFormCliente();
    setVistaCliente("form");
  };

  const abrirFormEditarCliente = (cliente) => {
    setClienteEditando(cliente);
    setFormNombre(cliente.NOMBRE ?? "");
    setFormTelefono(cliente.TELEFONO ?? "");
    setFormCorreo(cliente.CORREO ?? "");
    setFormDireccion(cliente.DIRECCION ?? "");
    setFormDescripcion(cliente.DESCRIPCION ?? "");
    setVistaCliente("form");
  };

  const volverListaClientes = () => {
    resetFormCliente();
    setVistaCliente("lista");
  };

  const asignarClienteAComanda = async (cliente) => {
    if (!comandaActiva) return;
    await Database.setClienteEnComanda(
      comandaActiva.comanda.ID,
      cliente?.ID ?? null,
    );
    setComandaActiva((prev) => ({
      ...prev,
      comanda: { ...prev.comanda, ID_CLIENTE: cliente?.ID ?? null },
    }));
    setClienteSeleccionado(cliente ?? null);
  };

  const guardarFormCliente = async () => {
    if (!formNombre.trim()) {
      Alert.alert("Campo requerido", "El nombre del cliente es obligatorio.");
      return;
    }
    if (guardandoCliente) return;
    setGuardandoCliente(true);
    try {
      const payload = {
        nombre: formNombre.trim(),
        telefono: formTelefono.trim(),
        correo: formCorreo.trim(),
        direccion: formDireccion.trim(),
        descripcion: formDescripcion.trim(),
      };

      if (clienteEditando?.ID) {
        const actualizado = await Database.updateCliente(
          clienteEditando.ID,
          payload,
        );
        const lista = await Database.getClientes();
        setClientes(lista ?? []);

        const idActual =
          clienteSeleccionado?.ID ?? comandaActiva?.comanda?.ID_CLIENTE;
        if (Number(idActual) === Number(clienteEditando.ID)) {
          setClienteSeleccionado(
            actualizado ?? {
              ...clienteEditando,
              NOMBRE: payload.nombre,
              TELEFONO: payload.telefono || null,
              CORREO: payload.correo || null,
              DIRECCION: payload.direccion || null,
              DESCRIPCION: payload.descripcion || null,
            },
          );
        }
        volverListaClientes();
      } else {
        const creado = await Database.insertCliente(payload);
        const lista = await Database.getClientes();
        setClientes(lista ?? []);
        if (creado) {
          await asignarClienteAComanda(creado);
          setModalCliente(false);
          setVistaCliente("lista");
          resetFormCliente();
        } else {
          volverListaClientes();
        }
      }
    } catch (e) {
      console.error("Error guardando cliente:", e);
      Alert.alert("Error", "No se pudo guardar el cliente.");
    } finally {
      setGuardandoCliente(false);
    }
  };

  const seleccionarCliente = async (cliente) => {
    if (guardandoCliente || !comandaActiva) return;
    setGuardandoCliente(true);
    try {
      await asignarClienteAComanda(cliente);
      setModalCliente(false);
      setVistaCliente("lista");
      resetFormCliente();
    } catch (e) {
      console.error("Error asignando cliente:", e);
    } finally {
      setGuardandoCliente(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={s.centrado}>
        <Loading color={gb.blue550} />
      </SafeAreaView>
    );
  }
  const agregarArticulo = (articulo) => {
    if (comandaActiva?.comanda?.ESTATUS === 4) return;
    solicitarEdicion(() => {
      if (navigationLockRef.current) return;
      navigationLockRef.current = true;
      router.push({
        pathname: "/DetalleArticulo",
        params: {
          articulo: JSON.stringify(articulo, null, 2),
          id_mesa: idMesa,
        },
      });
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} style={s.pantalla}>
      {/* Header — mismo patrón que Ticket */}
      <LinearGradient
        style={s.header}
        colors={
          comandaActiva?.comanda?.ESTATUS === 4
            ? ["#FB8C00", "#FFA726"]
            : gb.gradient_blue
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <View style={s.headerCenter}>
          <Text style={s.headerMesa}>{mesa?.NOMBRE ?? "Mesa"}</Text>
          <Text style={s.headerSub}>
            Folio #{comandaActiva?.comanda?.FICHA ?? "—"} · {fechaComanda}{" "}
            {horaComanda}
          </Text>
        </View>
        <View style={s.headerSpacer} />
      </LinearGradient>

      {clienteSeleccionado && (
        <View style={s.clienteStrip}>
          <Ionicons
            name="person-circle-outline"
            size={normalize(16)}
            color={gb.green500}
          />
          <Text style={s.clienteNombre} numberOfLines={1}>
            {clienteSeleccionado.NOMBRE}
          </Text>
          {!!clienteSeleccionado.TELEFONO && (
            <Text style={s.clienteTelefono}>{clienteSeleccionado.TELEFONO}</Text>
          )}
        </View>
      )}

      <View style={{ backgroundColor: gb.gray50 }}>
        {/* Buscador */}
        <View style={s.buscadorWrapper}>
          <Buscador
            placeholder="Buscar artículo..."
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* Filtro por grupo */}
        <View style={s.filtroContainer}>
          <Select
            placeholder="Todos los grupos"
            options={[
              { label: "Todos", value: null },
              ...grupos.map((g) => ({ label: g.NOMBRE, value: g.UUID })),
            ]}
            value={grupoSeleccionado}
            onChange={(val) => setGrupoSeleccionado(val)}
          />
        </View>
      </View>

      {/* Lista de grupos con artículos */}
      <ScrollView
        style={s.listaScroll}
        contentContainerStyle={s.listaContainer}
      >
        {datosFiltrados.length === 0 ? (
          <Text style={s.textoVacio}>No se encontraron artículos</Text>
        ) : (
          datosFiltrados.map((grupo) => (
            <View key={grupo.UUID} style={s.grupoWrapper}>
              <Card
                title={grupo.NOMBRE.toUpperCase()}
                linealGradient={gb.gradient_blue}
                styleTitleHeader={{ color: gb.gray50 }}
                styleHeader={{ width: "100%" }}
                styleBody={{
                  width: "100%",
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  paddingBottom: 0,
                }}
              >
                {grupo.articulos.map((articulo) => (
                  <CardArticulo
                    key={articulo.UUID}
                    articulo={articulo}
                    onPress={(a) => agregarArticulo(a)}
                  />
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
      {comandaActiva && (
        <MesasNavButtons
          tabActiva={tabActiva}
          idMesa={idMesa}
          comandaPayload={comandaActiva}
          tieneCliente={!!comandaActiva?.comanda?.ID_CLIENTE}
          onPressCliente={abrirModalCliente}
          onPressMenu={() => {
            setTabActiva("menu");
            setAuthHeaderTitulo("Menu");
            setModalCliente(false);
          }}
        />
      )}

      {/* Modal selección / alta / edición de cliente */}
      <GeneralModal
        visible={modalCliente}
        onRequestClose={() => {
          if (vistaCliente === "form") {
            volverListaClientes();
            return;
          }
          setModalCliente(false);
        }}
        headerTitle={
          vistaCliente === "form"
            ? clienteEditando
              ? "Editar cliente"
              : "Nuevo cliente"
            : "Seleccionar cliente"
        }
        headerColorGrandien={gb.gradient_blue}
        headerColorText={gb.gray50}
        iconCloseColor={gb.gray50}
        scrollable={false}
      >
        {vistaCliente === "form" ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ maxHeight: normalize(420) }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.modalFormScroll}
            >
              <Input
                label="Nombre completo *"
                placeholder="Ej. Juan Pérez"
                icon="person-outline"
                value={formNombre}
                onChange={setFormNombre}
              />
              <Input
                label="Teléfono"
                placeholder="Ej. 33 1234 5678"
                icon="call-outline"
                iconColor={gb.blue500}
                value={formTelefono}
                onChange={setFormTelefono}
                keyboardType="phone-pad"
              />
              <Input
                label="Correo electrónico"
                placeholder="Ej. correo@ejemplo.com"
                icon="mail-outline"
                iconColor={gb.purple550}
                value={formCorreo}
                onChange={setFormCorreo}
                keyboardType="email-address"
              />
              <Input
                label="Dirección"
                placeholder="Calle, número, colonia…"
                icon="location-outline"
                iconColor={gb.red400}
                value={formDireccion}
                onChange={setFormDireccion}
              />
              <Input
                label="Descripción"
                placeholder="Notas del cliente"
                icon="document-text-outline"
                value={formDescripcion}
                onChange={setFormDescripcion}
              />

              <View style={s.modalFormActions}>
                <Pressable
                  style={s.modalFormBtnSecundario}
                  onPress={volverListaClientes}
                  disabled={guardandoCliente}
                >
                  <Text style={s.modalFormBtnSecundarioText}>Cancelar</Text>
                </Pressable>
                <LinearGradient
                  colors={gb.gradient_blue}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.modalFormBtnPrimario}
                >
                  <Pressable
                    style={s.modalFormBtnPrimarioInner}
                    onPress={guardarFormCliente}
                    disabled={guardandoCliente}
                  >
                    <Text style={s.modalFormBtnPrimarioText}>
                      {guardandoCliente
                        ? "Guardando…"
                        : clienteEditando
                          ? "Guardar"
                          : "Crear y seleccionar"}
                    </Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <>
            <View style={s.modalBuscador}>
              <Buscador
                placeholder="Buscar cliente..."
                value={buscadorCliente}
                onChangeText={setBuscadorCliente}
              />
              <Pressable
                style={s.modalNuevoClienteBtn}
                onPress={abrirFormNuevoCliente}
              >
                <Ionicons
                  name="person-add-outline"
                  size={normalize(16)}
                  color={gb.blue550}
                />
                <Text style={s.modalNuevoClienteText}>Nuevo cliente</Text>
              </Pressable>
            </View>
            <FlatList
              data={clientesFiltrados}
              keyExtractor={(item) => String(item.ID)}
              contentContainerStyle={{ paddingBottom: normalize(20) }}
              ListHeaderComponent={
                <Button
                  styleContainer={s.modalClienteItem}
                  style={s.modalClienteBoton}
                  onPress={() => seleccionarCliente(null)}
                >
                  <View
                    style={[
                      s.modalClienteAvatar,
                      { backgroundColor: gb.gray200 },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={normalize(18)}
                      color={gb.gray500}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.modalClienteNombre}>Sin cliente</Text>
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
                <Text style={s.modalVacio}>Sin clientes registrados</Text>
              }
              renderItem={({ item }) => (
                <View style={s.modalClienteItem}>
                  <Pressable
                    style={s.modalClienteBoton}
                    onPress={() => seleccionarCliente(item)}
                  >
                    <View style={s.modalClienteAvatar}>
                      <Text style={s.modalClienteAvatarText}>
                        {item.NOMBRE?.split(" ")
                          .slice(0, 2)
                          .map((w) => w[0]?.toUpperCase())
                          .join("") ?? "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalClienteNombre}>{item.NOMBRE}</Text>
                      {!!item.TELEFONO && (
                        <Text style={s.modalClienteTelefono}>
                          {item.TELEFONO}
                        </Text>
                      )}
                    </View>
                    {clienteSeleccionado?.ID === item.ID && (
                      <Ionicons
                        name="checkmark-circle"
                        size={normalize(20)}
                        color={gb.green500}
                      />
                    )}
                  </Pressable>
                  <Pressable
                    style={s.modalClienteEditBtn}
                    onPress={() => abrirFormEditarCliente(item)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="create-outline"
                      size={normalize(18)}
                      color={gb.blue550}
                    />
                  </Pressable>
                </View>
              )}
            />
          </>
        )}
      </GeneralModal>

      <NipModal
        visible={modalNipEdicion}
        titulo="Editar ticket"
        onSubmit={confirmarNipEdicion}
        onClose={cerrarNipEdicion}
      />
    </SafeAreaView>
  );
};

export default MenuPrincipal;
