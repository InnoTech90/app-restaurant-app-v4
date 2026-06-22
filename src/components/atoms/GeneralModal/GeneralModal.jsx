import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import s from "./styles";


const GeneralModal = ({
    visible,
    onRequestClose,
    children,
    animationType = "slide",
    iconClose = true,
    headerColor = "white",
    headerColorGrandien = false,
    iconCloseColor = "black",
    headerTitle,
    headerColorText = 'black',
    scrollable = true,
}
) => {

    return (

        <Modal visible={visible} animationType={animationType} onRequestClose={onRequestClose} transparent={true}>
            <KeyboardAvoidingView
                style={s.background}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
            >
                {headerColorGrandien ?
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={headerColorGrandien} style={s.header} >
                        <Pressable onPress={onRequestClose} >
                            {iconClose && <Ionicons name="close" size={24} color={iconCloseColor}  style={{ alignSelf: "flex-end", marginBottom: 10 }} />}
                        </Pressable>
                        {headerTitle && <Text style={[s.headerTitleS, { color: headerColorText }]}>{headerTitle}</Text>}
                    </LinearGradient> :
                    <View style={[s.header, { backgroundColor: headerColor }]}>
                        <Pressable onPress={onRequestClose} >
                            {iconClose && <Ionicons name="close" size={24} color={iconCloseColor} />}
                        </Pressable>
                        {headerTitle && <Text style={[s.headerTitleS, { color: headerColorText }]}>{headerTitle}</Text>}
                    </View>
                }
                <View style={s.container}>
                    {scrollable ? (
                        <ScrollView
                            style={s.content}
                            contentContainerStyle={s.contentContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {children}
                        </ScrollView>
                    ) : (
                        <View style={[s.content, s.contentContainer]}>
                            {children}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export default GeneralModal;