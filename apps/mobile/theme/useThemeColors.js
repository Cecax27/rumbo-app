import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from './tokens';

const STORAGE_KEY = '@app.themeMode';

const ThemeColorsContext = createContext(null);

export function ThemeColorsProvider({ children }) {
  const systemScheme = useColorScheme();
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

  const isDark = effectiveScheme === 'dark';
  const themeTokens = isDark ? themes.dark : themes.light;

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

  const colors = useMemo(
    () => ({
      background: themeTokens?.background,
      surface: themeTokens?.surface,
      text: themeTokens?.text,
      subtext: themeTokens?.subtext,
      primary: themeTokens?.primary,
      border: themeTokens?.border,
      success: themeTokens?.success,
      error: themeTokens?.error,
      income: themeTokens?.income,
      spending: themeTokens?.spending,
      mint: themeTokens?.mint,
      mustard: themeTokens?.mustard,
      coral: themeTokens?.coral,
    }),
    [themeTokens]
  );

  if (!ready) return null;

  return (
    <ThemeColorsContext.Provider
      value={{ colors, mode, effectiveScheme, isDark, setMode, toggle, followSystem }}
    >
      <View className={isDark ? 'dark flex-1' : 'flex-1'}>{children}</View>
    </ThemeColorsContext.Provider>
  );
}

export function useThemeColors() {
  return useContext(ThemeColorsContext);
}
