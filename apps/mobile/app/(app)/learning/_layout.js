import { Stack } from 'expo-router'
import { useThemeColors } from '../../../theme/useThemeColors'
import { LearningProvider } from '../../../contexts/LearningContext'

export default function LearningLayout() {
  const { colors: theme } = useThemeColors()

  return (
    <LearningProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.background, elevation: 10 },
          headerTitleStyle: { color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 16 },
          headerTitleAlign: 'center',
          headerTintColor: theme.text,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="intro" options={{ title: 'Aprendizaje' }} />
      </Stack>
    </LearningProvider>
  )
}
