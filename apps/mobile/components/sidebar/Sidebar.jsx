import { View, Pressable, Image } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeColors } from '../../theme/useThemeColors'
import { Ionicons } from '@expo/vector-icons'
import { usePathname } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useState, useCallback } from 'react'
import SidebarItem from './SidebarItem'

const COLAPSED_WIDTH = 56
const EXPANDED_WIDTH = 220

const logo = require('../../assets/icon.png')

export default function Sidebar({ onWidthChange }) {
  const { colors: theme, isDark } = useThemeColors()
  const { t } = useTranslation()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const [expanded, setExpanded] = useState(false)

  const width = useSharedValue(COLAPSED_WIDTH)

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev
      width.value = withTiming(next ? EXPANDED_WIDTH : COLAPSED_WIDTH, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      })
      return next
    })
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }))

  const isActive = (route) =>
    pathname === route || pathname.startsWith(route + '/')

  const items = [
    {
      route: '/dashboard',
      icon: 'grid-outline',
      iconActive: 'grid',
      label: t('tabs.dashboard'),
    },
    {
      route: '/transactions',
      icon: 'card-outline',
      iconActive: 'card',
      label: t('tabs.transactions'),
    },
    {
      route: '/accounts',
      icon: 'wallet-outline',
      iconActive: 'wallet',
      label: t('tabs.accounts'),
    },
    {
      route: '/settings',
      icon: 'settings-outline',
      iconActive: 'settings',
      label: t('tabs.settings'),
    },
  ]

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
          borderRightWidth: 1,
          borderRightColor: theme.border,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          flexDirection: 'column',
          alignItems: expanded ? 'flex-start' : 'center',
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          width: '100%',
          paddingHorizontal: expanded ? 16 : 0,
          marginBottom: 24,
        }}
      >
        {expanded && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={logo} style={{ width: 28, height: 28 }} />
            <Animated.Text
              style={{
                fontSize: 16,
                fontFamily: 'Quicksand-Bold',
                color: theme.text,
              }}
              numberOfLines={1}
            >
              Rumbo
            </Animated.Text>
          </View>
        )}
        <Pressable
          onPress={toggle}
          style={({ pressed }) => ({
            padding: 4,
            opacity: pressed ? 0.5 : 1,
          })}
          hitSlop={8}
        >
          <Ionicons
            name={expanded ? 'close' : 'menu'}
            size={24}
            color={theme.subtext}
          />
        </Pressable>
      </View>

      {items.map((item) => (
        <SidebarItem
          key={item.route}
          route={item.route}
          icon={item.icon}
          iconActive={item.iconActive}
          label={item.label}
          expanded={expanded}
          active={isActive(item.route)}
          theme={theme}
        />
      ))}
    </Animated.View>
  )
}
