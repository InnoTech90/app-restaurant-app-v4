import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
export const s = StyleSheet.create({
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FF9800',
    },
    syncBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#FF9800',
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
    syncBadgeTextSync: {
        fontSize: 9,
        fontWeight: '600',
        color: gb.blue550,
    },
})