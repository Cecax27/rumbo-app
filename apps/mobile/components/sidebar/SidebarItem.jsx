import { Pressable, Text } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function SidebarItem({ route, icon, iconActive, label, expanded, active, theme }) {
  return (
    <Link href={route} asChild>
      <Pressable
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: expanded ? 16 : 0,
          marginBottom: 4,
          borderRadius: expanded ? 10 : 8,
          marginHorizontal: expanded ? 8 : 4,
          backgroundColor: active ? theme.surface : 'transparent',
          justifyContent: expanded ? 'flex-start' : 'center',
          borderLeftWidth: expanded && active ? 3 : 0,
          borderLeftColor: theme.primary,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Ionicons
          name={active ? iconActive : icon}
          size={22}
          color={active ? theme.primary : theme.subtext}
        />
        {expanded && (
          <Text
            style={{
              marginLeft: 12,
              fontSize: 14,
              fontFamily: 'Quicksand-SemiBold',
              color: active ? theme.primary : theme.text,
            }}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Link>
  )
}
