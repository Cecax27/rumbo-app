import { Stack } from 'expo-router';
import { useThemeColors } from '../../../theme/useThemeColors';

export default function AccountsLayout() {
    const { colors: theme } = useThemeColors()
    
  return <Stack 
  screenOptions={{
    headerShown: true,
    headerStyle: { backgroundColor: theme.background, elevation: 10 },
    headerTitleStyle: { color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 16 },
    headerTitleAlign: 'center',
    headerTitleContainerStyle: {
        maxWidth: "100%",
    },
    headerTintColor: theme.text
}}
  />;
}