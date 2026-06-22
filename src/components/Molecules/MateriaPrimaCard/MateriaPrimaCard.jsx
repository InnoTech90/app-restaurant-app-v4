import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import EstatusSincronizado from "../../atoms/EstatusSincronizado/EstatusSincronizado";

const fmtStock = (val) =>
    val !== null && val !== undefined ? String(parseFloat(val)) : "0";

const bajoPorcentaje = (actual, minimo) => {
    if (!minimo || minimo <= 0) return false;
    return parseFloat(actual) <= parseFloat(minimo);
};

const MateriaPrimaCard = ({ item, onPress }) => {
    const bajo = bajoPorcentaje(item.STOCK_ACTUAL, item.STOCK_MINIMO);
    return (
        <Pressable
            style={({ pressed }) => [s.card, { opacity: pressed ? 0.85 : 1 }]}
            onPress={onPress}
        >
            <LinearGradient
                style={s.cardAccent}
                colors={bajo ? [gb.yellow400, gb.yellow600] : gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <View style={s.cardBody}>
                <View style={s.cardRow}>
                    <Text style={s.cardNombre} numberOfLines={1}>
                        {item.NOMBRE}
                    </Text>
                    <EstatusSincronizado sincronizado={item.SINCRONIZADO === 1} />
                    <Ionicons
                        name="chevron-forward"
                        size={normalize(16)}
                        color={gb.gray300}
                        style={{ marginLeft: normalize(4) }}
                    />
                </View>
                <View style={s.cardStockRow}>
                    <Text style={s.cardStock}>Stock: </Text>
                    <Text style={s.cardStockDestacado}>
                        {fmtStock(item.STOCK_ACTUAL)}
                    </Text>
                    <Text style={s.cardStock}>
                        / {fmtStock(item.STOCK_MAXIMO)}
                    </Text>
                    {item.UNIDAD_ABREVIACION ? (
                        <Text style={s.cardUnidad}>{item.UNIDAD_ABREVIACION}</Text>
                    ) : null}
                    {bajo && (
                        <Text style={s.cardStockMinTag}>⚠ Stock bajo</Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const s = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: normalize(14),
        flexDirection: "row",
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    cardAccent: {
        width: normalize(5),
    },
    cardBody: {
        flex: 1,
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(12),
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardNombre: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: gb.purple800,
        flex: 1,
    },
    cardStockRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: normalize(4),
        gap: normalize(6),
    },
    cardStock: {
        fontSize: normalize(13),
        color: gb.gray600,
    },
    cardStockDestacado: {
        fontSize: normalize(14),
        fontWeight: "bold",
        color: gb.purple550,
    },
    cardUnidad: {
        fontSize: normalize(12),
        color: gb.gray400,
        backgroundColor: gb.gray100,
        paddingHorizontal: normalize(6),
        paddingVertical: normalize(2),
        borderRadius: normalize(6),
    },
    cardStockMinTag: {
        fontSize: normalize(11),
        color: gb.yellow600,
        backgroundColor: gb.yellow50,
        paddingHorizontal: normalize(6),
        paddingVertical: normalize(2),
        borderRadius: normalize(6),
        overflow: "hidden",
    },
});

export default MateriaPrimaCard;
