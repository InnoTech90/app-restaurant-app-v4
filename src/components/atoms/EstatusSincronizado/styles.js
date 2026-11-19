import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { color as tema } from "../../../utils/theme";
export const s = StyleSheet.create({
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tema.warningSoft,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: '#E58A00',
    },
    syncBadgeSync: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: gb.blue100,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: gb.blue550,
    },
})