import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeColors } from '../../theme/useThemeColors'
import { useSidebar } from '../../contexts/SidebarContext'

export default function SidebarTrigger() {
  const { colors: theme } = useThemeColors()
  const insets = useSafeAreaInsets()
  const { open } = useSidebar()

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => ({
        position: 'absolute',
        top: insets.top + 12,
        left: 16,
        zIndex: 101,
        padding: 10,
        borderRadius: 12,
        backgroundColor: theme.surface,
        opacity: pressed ? 0.7 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
      })}
    >
      <Ionicons name="menu" size={24} color={theme.text} />
    </Pressable>
  )
}
