import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { s } from "./style";

function Input({
  label,
  placeholder,
  value,
  onChange,
  secureTextEntry,
  style,
  styleInput,
  icon,
  iconColor = gb.gray300,
  maxLength,
  keyboardType,
  onFocus,
  textAlign,
  editable = true,
  multiline,
  numberOfLines,
}) {
  return (
    <>
      <View style={[s.inputContainer, style]}>
        {label && <Text style={s.label}>{label}</Text>}
        <View style={s.inputWrapper}>
          {icon && (
            <View style={s.iconContainer}>
              <Ionicons name={icon} size={18} color={iconColor} />
            </View>
          )}
          <TextInput
            style={[s.input, icon && s.inputWithIcon, styleInput]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            secureTextEntry={!!secureTextEntry}
            placeholderTextColor={gb.gray300}
            maxLength={maxLength}
            keyboardType={keyboardType}
            onFocus={onFocus}
            textAlign={textAlign}
            editable={editable}
            multiline={secureTextEntry ? false : multiline}
            numberOfLines={secureTextEntry ? 1 : numberOfLines}
            textContentType={secureTextEntry ? "password" : undefined}
            autoComplete={secureTextEntry ? "password" : undefined}
          />
        </View>
      </View>
    </>
  );
}
export default Input;
