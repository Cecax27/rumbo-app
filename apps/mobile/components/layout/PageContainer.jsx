import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeColors } from '../../theme/useThemeColors'
import SidebarTrigger from '../sidebar/SidebarTrigger'

export default function PageContainer({ children, style }) {
  const { colors: theme } = useThemeColors()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      <SidebarTrigger />
      {children}
    </View>
  )
}
