import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../theme/useTheme";
import { useState, useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { makeStyles } from "../assets/uiStyles";
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
  const { theme } = useTheme();
  const borderColor = focusColor || theme.border;
  const styles = useMemo(()=>makeStyles(theme), [theme]);
  const { t }= useTranslation();


  const [focus, setFocus] = useState(false);

  return (
    <View style={{ paddingVertical: 10, flexDirection: "column", gap:8 }}>
      {!labelInline && (
        <Text
          style={{
            backgroundColor: theme.background,
            color: theme.subtext,
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
          borderColor: focus ? borderColor : theme.border,
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
              backgroundColor: theme.background,
              color: theme.subtext,
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
                color={theme.border}
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
                color: theme.text,
                flex:1
              }}
              dropdownIconColor={theme.border}
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
