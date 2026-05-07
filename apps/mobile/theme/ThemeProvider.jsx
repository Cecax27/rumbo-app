import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';
import { themes } from './tokens';

const STORAGE_KEY = '@app.themeMode'; // 'system' | 'light' | 'dark'

export default function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setMode(saved);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode, ready]);

  const effectiveScheme = useMemo(() => {
    if (mode === 'system') return systemScheme ?? 'light';
    return mode;
  }, [mode, systemScheme]);

  const theme = effectiveScheme === 'dark' ? themes.dark : themes.light;
  const isDark = effectiveScheme === 'dark';

  const followSystem = useCallback(() => setMode('system'), []);
  const toggle = useCallback(() => {
    if (mode === 'system') {
      setMode(isDark ? 'light' : 'dark');
    } else {
      setMode(mode === 'dark' ? 'light' : 'dark');
    }
  }, [mode, isDark]);

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  if (!ready) return null;

  return (
    <ThemeContext.Provider
      value={{ ready, theme, mode, effectiveScheme, isDark, setMode, toggle, followSystem }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
