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
        top: insets.top + 16,
        left: 16,
        zIndex: 101,
        padding: 10,
        borderRadius: 10,
        backgroundColor: theme.surface,
        opacity: pressed ? 0.7 : 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      })}
    >
      <Ionicons name="menu" size={24} color={theme.text} />
    </Pressable>
  )
}
