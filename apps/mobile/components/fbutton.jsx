import { Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useThemeColors } from '../theme/useThemeColors';

export default function FButton({ text, onPress, active = true }) {
    const { colors } = useThemeColors();

  return (
        <TouchableOpacity
            className="flex-1 items-center justify-center rounded-full p-2.5"
            style={{ backgroundColor: active ? colors.primary : colors.surface }}
            onPress={onPress}
    >
            <Text
                style={{
                    color: active ? '#1A1A1A' : colors.subtext,
                    fontFamily: 'Montserrat-SemiBold',
                    fontSize: 12,
                }}
            >
                {text}
            </Text>
    </TouchableOpacity>
    );
}