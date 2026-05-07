// src/components/ThemeSwitcher.jsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

export default function ThemeSwitcher() {
  const { theme, mode, setMode, toggle, followSystem } = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <Chip label="Sistema" active={mode === 'system'} onPress={followSystem} />
      <Chip label="Claro"   active={mode === 'light'}   onPress={() => setMode('light')} />
      <Chip label="Oscuro"  active={mode === 'dark'}    onPress={() => setMode('dark')} />
      <Chip label="Alternar" onPress={toggle} />
    </View>
  );
}

function Chip({ label, active, onPress }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { 
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: theme.border
        }
      ]}
    >
      <Text style={{ color: active ? theme.background : theme.text }}>{label}</Text>
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
