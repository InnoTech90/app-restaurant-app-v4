import { View } from "react-native";
import { s } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { gb } from "../../../screens/globalStyles";

const EstatusSincronizado = ({ sincronizado }) => {
    return (
        <>
            {sincronizado ?

                <View style={s.syncBadgeSync}>
                    <Ionicons name="cloud-done-outline" size={14} color={gb.blue550} />
                </View> :
                <View style={s.syncBadge}>
                    <Ionicons name="cloud-upload-outline" size={14} color="#FF9800" />
                </View>
            }
        </>
    )
}

export default EstatusSincronizado;