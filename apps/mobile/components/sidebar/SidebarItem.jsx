import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function SidebarItem({
  route,
  icon,
  iconActive,
  label,
  active,
  theme,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 6,
        borderRadius: 12,
        backgroundColor: active ? theme.surface : 'transparent',
        borderLeftWidth: active ? 3 : 0,
        borderLeftColor: theme.primary,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons
        name={active ? iconActive : icon}
        size={22}
        color={active ? theme.primary : theme.subtext}
      />
      <Text
        style={{
          marginLeft: 14,
          fontSize: 16,
          fontFamily: 'Quicksand-SemiBold',
          color: active ? theme.primary : theme.text,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}
