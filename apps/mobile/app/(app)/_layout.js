import { View } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useThemeColors } from '../../theme/useThemeColors'
import { SidebarProvider } from '../../contexts/SidebarContext'
import ErrorBoundary from '../../components/ErrorBoundary'

export default function AppLayout() {
  const { colors: theme, effectiveScheme } = useThemeColors()

  return (
    <SidebarProvider>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </SidebarProvider>
  )
}
