import { createContext, useContext, useEffect, useMemo } from 'react';
import { StatusBar, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { themes } from './tokens';

const ThemeColorsContext = createContext(null);

export function ThemeColorsProvider({ children }) {
  const { colorScheme } = useColorScheme();
  const effectiveScheme = colorScheme ?? 'light';

  const isDark = effectiveScheme === 'dark';
  const themeTokens = isDark ? themes.dark : themes.light;

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

  return (
    <ThemeColorsContext.Provider value={{ colors, effectiveScheme, isDark }}>
      <View className={isDark ? 'dark flex-1' : 'flex-1'}>
        {children}
      </View>
    </ThemeColorsContext.Provider>
  );
}

export function useThemeColors() {
  return useContext(ThemeColorsContext);
}
