import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { useThemeColors } from "../theme/useThemeColors";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  focusColor,
  icon = null,
  numeric = false,
  email = false,
  text = false,
  autoCapitalize = "sentences",
  keyboardType = "default",
  secureTextEntry = false,
  textContentType = "none",
  autoComplete = "off",
  labelInline = true,
  optional = false,
  editable = true,
  clear = true,
}) {
  const { colors } = useThemeColors();
  const borderColor = focusColor || colors.border;
  const { t } = useTranslation();

  const [focus, setFocus] = useState(false);

  return (
    <View className="w-full">
      <Text className="label">
        {label} {optional ? `(${t("common.optional")})` : ""}
      </Text>
      <View className="flex-row items-center ">
        {icon && (
          <MaterialIcons
            name={icon}
            color={colors.border}
            size={18}
            style={{ marginRight: 4 }}
          />
        )}
        <TextInput
          className="input"
          placeholder={placeholder}
          inputMode={numeric ? "numeric" : email ? "email" : "text"}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          value={value}
          onChangeText={(text) => onChange(text)}
          autoCapitalize={autoCapitalize}
          keyboardType={
            numeric ? "numeric" : email ? "email" : text ? "text" : keyboardType
          }
          secureTextEntry={secureTextEntry}
          scrollEnabled
          editable={editable}
        />
        {clear && (
          <TouchableOpacity
            onPress={() => onChange("")}
            style={{ marginRight: 6 }}
          >
            <MaterialIcons name="clear" color={colors.border} size={18} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
