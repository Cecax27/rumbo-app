import { View } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useThemeColors } from '../../theme/useThemeColors'
import Sidebar from '../../components/sidebar/Sidebar'

export default function AppLayout() {
  const { colors: theme, effectiveScheme } = useThemeColors()

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.background,
      }}
    >
      <Sidebar />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <StatusBar style={effectiveScheme} />
    </View>
  )
}
