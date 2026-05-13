// src/components/ThemeSwitcher.jsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

export default function ThemeSwitcher() {
  const { colors, mode, setMode, toggle, followSystem } = useThemeColors();

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <Chip label="Sistema" active={mode === 'system'} onPress={followSystem} />
      <Chip label="Claro"   active={mode === 'light'}   onPress={() => setMode('light')} />
      <Chip label="Oscuro"  active={mode === 'dark'}    onPress={() => setMode('dark')} />
      <Chip label="Alternar" onPress={toggle} />
    </View>
  );
}

function Chip({ label, active, onPress }) {
  const { colors } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { 
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: colors.border
        }
      ]}
    >
      <Text style={{ color: active ? colors.background : colors.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
});
