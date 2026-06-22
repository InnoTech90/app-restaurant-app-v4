import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Mesa from "../../../../components/Molecules/Mesa/Mesa";
import { gb } from "../../../globalStyles";
import { Database } from "./database";
import { s } from "./styles";

const Inicio = () => {
    const router = useRouter();
    const [mesas, setMesas] = useState([]);

    useEffect(() => {
        getMesas();
    }, []);

    const getMesas = async () => {
        const mesasdb = await Database.getMesas();
        setMesas(mesasdb);
    };

    const seleccionarMesa = async (mesa) => {
        await AsyncStorage.setItem("MesaSeleccionada", mesa.UUID);
        router.push(`/Menu Principal?id_mesa=${mesa.UUID}`);
    };

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: gb.gray50 }}>
                <View style={s.mesasContainer}>
                    {mesas.map((mesa, index) => (
                        <Mesa
                            key={mesa.ID}
                            id={mesa.ID}
                            nombre={mesa.NOMBRE}
                            descripcion={mesa.DESCRIPCION}
                            status={mesa.TIENE_COMANDA_ACTIVA === 1}
                            onPress={() => seleccionarMesa(mesa)}
                            index={index + 1}
                            mesas={mesas}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
export default Inicio;