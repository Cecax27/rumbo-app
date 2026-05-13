import { View, Text } from 'react-native';
import React from 'react';
import { useThemeColors } from '../theme/useThemeColors';

export default function LabelWithText({ label, text }) {
  const { colors } = useThemeColors();

  return (
    <View className="mb-3" style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Regular', color: colors.subtext }}>
        {label}
      </Text>
      <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Regular', color: colors.text }}>
        {text}
      </Text>
    </View>
  );
}