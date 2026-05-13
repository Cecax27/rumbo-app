import { Stack } from 'expo-router';
import { useThemeColors } from '../../../theme/useThemeColors';

export default function ConfigurationLayout() {
  const { colors: theme } = useThemeColors();

  return <Stack 
    screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.background, elevation: 10 },
        headerTitleStyle: { color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 16 },
        headerTitleAlign: 'center',
        headerTintColor:  theme.text 
    }}
  />;
}