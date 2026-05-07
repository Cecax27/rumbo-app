import { Stack } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';

export default function AccountsLayout() {
    const {theme} = useTheme()
    
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