import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
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
  headerColorText = "black",
  scrollable = true,
}) => {
  const headerContent = (
    <>
      <Pressable onPress={onRequestClose} hitSlop={8}>
        {iconClose && (
          <Ionicons
            name="close"
            size={normalize(24)}
            color={iconCloseColor}
          />
        )}
      </Pressable>
      {headerTitle ? (
        <Text
          style={[s.headerTitleS, { color: headerColorText }]}
          numberOfLines={1}
        >
          {headerTitle}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      onRequestClose={onRequestClose}
      transparent={true}
    >
      <KeyboardAvoidingView
        style={s.background}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
      >
        <View style={s.sheet}>
          {headerColorGrandien ? (
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={headerColorGrandien}
              style={s.header}
            >
              {headerContent}
            </LinearGradient>
          ) : (
            <View style={[s.header, { backgroundColor: headerColor }]}>
              {headerContent}
            </View>
          )}
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
              <View style={[s.content, s.contentContainer]}>{children}</View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GeneralModal;
