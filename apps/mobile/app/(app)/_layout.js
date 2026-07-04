import { View } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useThemeColors } from '../../theme/useThemeColors'
import { SidebarProvider } from '../../contexts/SidebarContext'

export default function AppLayout() {
  const { colors: theme, effectiveScheme } = useThemeColors()

  return (
    <SidebarProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          padding: 10
        }}
      >
        <Slot />
        <StatusBar style={effectiveScheme} />
      </View>
    </SidebarProvider>
  )
}
