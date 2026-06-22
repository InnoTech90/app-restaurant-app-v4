import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import Card from "../Card/Card";
import { s } from "./styles";

const PagoInfoComanda = ({
    mesa,
    comanda,
    cliente,
    fecha,
    hora,
    onAbrirModalCliente,
}) => (
    <View style={s.wrapper}>
        <Card
            title="INFORMACIÓN"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: gb.gray50 }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
        >
            <View style={s.body}>
                <View style={s.row}>
                    <Text style={s.label}>Mesa</Text>
                    <Text style={s.valor}>{mesa?.NOMBRE ?? "—"}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Folio</Text>
                    <Text style={s.valor}>#{comanda?.FICHA ?? "—"}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Fecha</Text>
                    <Text style={s.valor}>{fecha} · {hora}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Cliente</Text>
                    <Button
                        styleContainer={s.clienteBtnContainer}
                        style={s.clienteBtn}
                        onPress={onAbrirModalCliente}
                    >
                        <Ionicons
                            name="person-outline"
                            size={normalize(16)}
                            color={cliente ? gb.green500 : gb.blue550}
                        />
                        <Text style={[s.clienteBtnTexto, cliente && { color: gb.green500 }]}>
                            {cliente ? cliente.NOMBRE.split(" ")[0] : "Asignar cliente"}
                        </Text>
                    </Button>
                </View>
            </View>
        </Card>
    </View>
);

export default PagoInfoComanda;
