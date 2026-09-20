import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Input from "../../atoms/Input/Input";
import { dataBase } from "./database";
import { s } from "./styles";

/**
 * Valida NIP.
 * modo="dueño" → CONFIGURACIONES.NIP (default)
 * modo="gerente" → GERENTES.NIP
 */
const NipModal = ({ visible, onClose, onSubmit, titulo, modo = "dueño" }) => {
  const [nip, setNip] = useState("");
  const [nombreSucursal, setNombreSucursal] = useState(null);

  useEffect(() => {
    if (!visible) {
      setNip("");
      return;
    }

    let activo = true;
    dataBase.getNombreSucursal().then((nombre) => {
      if (activo) setNombreSucursal(nombre);
    });

    return () => {
      activo = false;
    };
  }, [visible]);

  const verificarNip = async () => {
    if (modo === "gerente") {
      const result = await dataBase.validarNipGerente(nip);
      if (result.reason === "no_gerentes") {
        alert(
          "No hay gerentes con NIP configurado. Sincroniza los datos e intenta de nuevo.",
        );
        return;
      }
      if (result.reason === "empty") {
        alert("Ingresa el NIP del gerente.");
        return;
      }
      if (!result.ok) {
        alert("NIP incorrecto");
        return;
      }
      await onSubmit(result.gerente);
      return;
    }

    const nipDueño = await dataBase.getNipDueño();
    if (nipDueño == null || String(nipDueño).trim() === "") {
      alert(
        "No hay NIP configurado. Sincroniza los datos e intenta de nuevo.",
      );
      return;
    }

    if (String(nip).trim() === String(nipDueño).trim()) {
      await onSubmit();
    } else {
      alert("NIP incorrecto");
    }
  };

  const subtitulo =
    modo === "gerente"
      ? "Ingresa el NIP del gerente para continuar"
      : nombreSucursal
        ? `Ingresa el NIP de ${nombreSucursal} para continuar`
        : "Ingresa el NIP de la sucursal para continuar";

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
        <Text style={s.subTitleModal}>{subtitulo}</Text>
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
