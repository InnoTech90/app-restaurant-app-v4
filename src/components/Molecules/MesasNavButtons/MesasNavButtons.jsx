import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { setAuthHeaderTitulo } from "../../../utils/authHeaderTitle";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import { s } from "./styles";

/**
 * Barra inferior de navegación entre Clientes / Menu / Comanda / Pagar.
 * @param {"cliente"|"menu"|"comanda"|"pagar"} tabActiva
 * @param {string} idMesa
 * @param {object|null} comandaPayload - { comanda, articulos, totalComanda } para Ticket/Pago
 * @param {boolean} tieneCliente
 * @param {() => void} onPressCliente
 */
const MesasNavButtons = ({
  tabActiva = "menu",
  idMesa,
  comandaPayload = null,
  tieneCliente = false,
  onPressCliente,
  onPressMenu,
  onPressComanda,
  onPressPagar,
}) => {
  const router = useRouter();

  const irMenu = () => {
    if (onPressMenu) {
      onPressMenu();
      return;
    }
    if (tabActiva === "menu") return;
    setAuthHeaderTitulo("Menu");
    router.replace({
      pathname: "/Menu Principal",
      params: { id_mesa: idMesa },
    });
  };

  const irComanda = () => {
    if (onPressComanda) {
      onPressComanda();
      return;
    }
    if (tabActiva === "comanda") return;
    if (!comandaPayload) return;
    setAuthHeaderTitulo("Comanda");
    router.replace({
      pathname: "/Ticket",
      params: {
        comanda: JSON.stringify(comandaPayload),
        id_mesa: idMesa,
      },
    });
  };

  const irPagar = () => {
    if (onPressPagar) {
      onPressPagar();
      return;
    }
    if (tabActiva === "pagar") return;
    if (!comandaPayload) return;
    setAuthHeaderTitulo("Pagar");
    router.replace({
      pathname: "/Pago",
      params: {
        comanda: JSON.stringify(comandaPayload),
        id_mesa: idMesa,
      },
    });
  };

  const colorCliente =
    tabActiva === "cliente"
      ? gb.gray50
      : tieneCliente
        ? gb.green500
        : gb.blue550;

  return (
    <View style={s.containerButtons}>
      <Button
        styleContainer={s.botonAccionContainer}
        style={[s.botonAccion, tabActiva === "cliente" && s.botonAccionActivo]}
        onPress={onPressCliente}
      >
        <Ionicons
          name="person-outline"
          size={normalize(22)}
          color={colorCliente}
        />
        <Text style={[s.botonAccionTexto, { color: colorCliente }]}>
          Clientes
        </Text>
      </Button>

      <View style={s.botonAccionDivider} />

      <Button
        styleContainer={s.botonAccionContainer}
        style={[s.botonAccion, tabActiva === "menu" && s.botonAccionActivo]}
        onPress={irMenu}
      >
        <Ionicons
          name="menu-outline"
          size={normalize(22)}
          color={tabActiva === "menu" ? gb.gray50 : gb.purple550}
        />
        <Text
          style={[
            s.botonAccionTexto,
            { color: tabActiva === "menu" ? gb.gray50 : gb.purple550 },
          ]}
        >
          Menu
        </Text>
      </Button>

      <Button
        styleContainer={s.botonAccionContainer}
        style={[s.botonAccion, tabActiva === "comanda" && s.botonAccionActivo]}
        onPress={irComanda}
      >
        <Ionicons
          name="receipt-outline"
          size={normalize(22)}
          color={tabActiva === "comanda" ? gb.gray50 : gb.purple550}
        />
        <Text
          style={[
            s.botonAccionTexto,
            { color: tabActiva === "comanda" ? gb.gray50 : gb.purple550 },
          ]}
        >
          Comanda
        </Text>
      </Button>

      <View style={s.botonAccionDivider} />

      <Button
        styleContainer={s.botonAccionContainer}
        style={[s.botonAccion, tabActiva === "pagar" && s.botonAccionActivo]}
        onPress={irPagar}
      >
        <Ionicons
          name="cash-outline"
          size={normalize(22)}
          color={tabActiva === "pagar" ? gb.gray50 : gb.purple550}
        />
        <Text
          style={[
            s.botonAccionTexto,
            { color: tabActiva === "pagar" ? gb.gray50 : gb.purple550 },
          ]}
        >
          Pagar
        </Text>
      </Button>
    </View>
  );
};

export default MesasNavButtons;
