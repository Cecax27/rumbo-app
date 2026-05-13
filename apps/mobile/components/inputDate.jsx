import { View, TextInput, Text, TouchableOpacity, Platform } from "react-native";
import { useThemeColors } from "../theme/useThemeColors";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePicker from '@react-native-community/datetimepicker'

export default function InputDate({
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

  const [visible, setVisible] = useState(false);
  const [focus, setFocus] = useState(false);

  const handleDateConfirm = ({ type }, date) => {
    if (type === 'set') {
        onChange(date);
        setVisible(false)
    } else {
      setVisible(!visible)
    }
  }

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
        }}
      >
        {visible && (
            <DateTimePicker 
                mode='date'
                display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                value={value}
                onChange={handleDateConfirm}
                style={{ width: '100%' }}
            />
        )}
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
            <TouchableOpacity 
                onPress={()=>setVisible(true)}
                style={{ alignItems: 'center', justifyContent: 'center' }}
            >
                <TextInput 
                    placeholder={t('transactions.date')}
                    value={value.toLocaleDateString()}
                    style={{
                      outlineWidth: 0,
                      color: colors.text,
                      fontFamily: "Montserrat-Medium",
                      fontSize: 14,
                    }}
                    editable={false}
                />  
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
