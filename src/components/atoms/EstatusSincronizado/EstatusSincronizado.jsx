import { View, Text } from "react-native";
import { s } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { gb } from "../../../screens/globalStyles";

const EstatusSincronizado = ({ sincronizado }) => {
    return (
        <>
            {sincronizado ?

                <View style={s.syncBadgeSync}>
                    <Ionicons name="cloud-done-outline" size={14} color={gb.blue550} />
                    {/* <Text style={s.syncBadgeTextSync}>Sincronizado</Text> */}
                </View> :
                <View style={s.syncBadge}>
                    <Ionicons name="cloud-upload-outline" size={14} color="#FF9800" />
                    {/* <Text style={s.syncBadgeText}> sincronizar</Text> */}
                </View>
            }
        </>
    )
}

export default EstatusSincronizado;