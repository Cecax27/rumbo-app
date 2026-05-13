import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useThemeColors } from "../theme/useThemeColors";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function InputPicker({
  label,
  placeholder,
  value,
  onChange,
  focusColor,
  options,
  labelFormat = (label)=>label,
  optionlabel,
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
  prompt = null,
}) {
  const { colors } = useThemeColors();
  const borderColor = focusColor || colors.border;
  const { t }= useTranslation();


  const [focus, setFocus] = useState(false);

  return (
    <View style={{ paddingVertical: 10, flexDirection: "column", gap:8 }}>
      {!labelInline && (
        <Text
          style={{
            backgroundColor: colors.background,
            color: colors.subtext,
            paddingHorizontal: 6,
            fontSize: 12,
            fontFamily: focus ? "Montserrat-SemiBold" : "Montserrat-Regular",
          }}
        >
         {label}
        </Text>
      )}
      <View
        style={{
          borderWidth: focus ? 2 : 1,
          borderRadius: 25,
          borderColor: focus ? borderColor : colors.border,
          height: 60,
          justifyContent: "center",
          paddingHorizontal: 8,
          flex: 1,
        }}
      >
        {labelInline && (
          <Text
            style={{
              position: "absolute",
              top: -10,
              left: 25,
              backgroundColor: colors.background,
              color: colors.subtext,
              paddingHorizontal: 6,
              fontSize: 12,
              fontFamily: focus ? "Montserrat-SemiBold" : "Montserrat-Regular",
            }}
          >
            {label}
          </Text>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              marginLeft: 8,
            }}
          >
            {icon && (
              <MaterialIcons
                name={icon}
                color={colors.border}
                size={18}
                style={{ marginRight: 4 }}
              />
            )}
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) =>
                onChange(itemValue)
              }
              style={{
                fontSize:14,
                fontFamily: 'Montserrat-Medium',
                color: colors.text,
                flex:1
              }}
              dropdownIconColor={colors.border}
              prompt={prompt}
            >
              
              {options.map((option) => (
                <Picker.Item
                  key={option.id}
                  label={labelFormat(option[optionlabel])}
                  value={option.id}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}
