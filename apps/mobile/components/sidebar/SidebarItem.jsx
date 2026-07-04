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
      style={{ flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingLeft: active ? 9 : 12,
        paddingRight: 12,
        marginBottom: 10,
        borderRadius: 12,
        backgroundColor: 'transparent'
      }}
    >
      <Ionicons
        name={active ? iconActive : icon}
        size={20}
        color={active ? theme.primary : theme.subtext}
        style={{ flexShrink: 0 }}
      />
      <Text
        style={{
          marginLeft: 12,
          fontSize: 14,
          fontFamily: 'Quicksand-SemiBold',
          color: active ? theme.primary : theme.subtext,
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}
