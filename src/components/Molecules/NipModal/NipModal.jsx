import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Input from "../../atoms/Input/Input";
import { dataBase } from "./database";
import { s } from "./styles";

const NipModal = ({ visible, onClose, onSubmit, titulo }) => {
  const { gerenteSesion } = useContext(AuthContext);
  const [nip, setNip] = useState("");

  useEffect(() => {
    if (!visible) setNip("");
  }, [visible]);

  const verificarNip = async () => {
    if (!gerenteSesion) {
      alert("No hay un usuario autenticado. Vuelve a iniciar sesión.");
      return;
    }

    const nipGuardado = await dataBase.getNipGerenteAutenticado(gerenteSesion);
    if (nipGuardado == null || String(nipGuardado).trim() === "") {
      alert(
        "No se encontró el NIP del usuario autenticado. Cierra sesión e inicia de nuevo.",
      );
      return;
    }

    if (String(nip).trim() === String(nipGuardado).trim()) {
      await onSubmit();
    } else {
      alert("NIP incorrecto");
    }
  };

  const nombreUsuario = gerenteSesion?.nombre
    ? `NIP de ${gerenteSesion.nombre}`
    : "Ingresa tu NIP para continuar";

  return (
    <GeneralModal visible={visible} onRequestClose={onClose}>
      <View style={s.container}>
        <LinearGradient
          style={s.iconContainer}
          colors={gb.gradient_blue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="shield-checkmark" size={40} color={gb.gray50} />
        </LinearGradient>
        <Text style={s.titleModal}>{titulo}</Text>
        <Text style={s.subTitleModal}>{nombreUsuario}</Text>
        <Input
          placeholder="NIP"
          secureTextEntry={true}
          style={s.input}
          icon="apps"
          iconColor={gb.purple500}
          value={nip}
          onChange={(text) => setNip(text)}
          keyboardType="numeric"
          maxLength={8}
          styleInput={{
            textAlign: "center",
            letterSpacing: 8,
            fontSize: normalize(20),
          }}
        />
        <View style={s.buttonsContainer}>
          <Button onPress={onClose} style={s.btnCancelar}>
            <Text style={s.btnCancelarText}>Cancelar</Text>
          </Button>
          <Button onPress={verificarNip} style={s.btnConfirmar}>
            <Text style={s.btnConfirmarText}>Confirmar</Text>
          </Button>
        </View>
      </View>
    </GeneralModal>
  );
};

export default NipModal;
