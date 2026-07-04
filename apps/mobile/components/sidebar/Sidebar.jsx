import { View, Pressable, Image, Text, TouchableWithoutFeedback } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeColors } from '../../theme/useThemeColors'
import { Ionicons } from '@expo/vector-icons'
import { usePathname, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useState, useCallback } from 'react'
import SidebarItem from './SidebarItem'

const logo = require('../../assets/icon.png')

export default function Sidebar() {
  const { colors: theme } = useThemeColors()
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false)

  const backdropOpacity = useSharedValue(0)
  const panelTranslateX = useSharedValue(-400)

  const close = useCallback((done) => {
    backdropOpacity.value = withTiming(0, { duration: 200 })
    panelTranslateX.value = withTiming(
      -400,
      { duration: 200, easing: Easing.in(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(setVisible)(false)
          if (done) runOnJS(done)()
        }
      }
    )
  }, [])

  const open = useCallback(() => {
    setVisible(true)
    backdropOpacity.value = 0
    panelTranslateX.value = -400
    backdropOpacity.value = withTiming(1, { duration: 250 })
    panelTranslateX.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    })
  }, [])

  const handleNavigate = useCallback(
    (route) => {
      close(() => {
        router.push(route)
      })
    },
    [close, router]
  )

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panelTranslateX.value }],
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
    <>
      <Pressable
        onPress={open}
        style={({ pressed }) => ({
          position: 'absolute',
          top: insets.top + 8,
          left: 12,
          zIndex: 100,
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.surface,
          opacity: pressed ? 0.7 : 1,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        })}
      >
        <Ionicons name="menu" size={24} color={theme.text} />
      </Pressable>

      {visible && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
              },
              backdropAnimatedStyle,
            ]}
          >
            <TouchableWithoutFeedback onPress={() => close()}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '100%',
                backgroundColor: theme.background,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingHorizontal: 24,
              },
              panelAnimatedStyle,
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 36,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <Image source={logo} style={{ width: 32, height: 32 }} />
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: 'Quicksand-Bold',
                    color: theme.text,
                  }}
                >
                  Rumbo
                </Text>
              </View>
              <Pressable onPress={() => close()} hitSlop={8}>
                <Ionicons name="close" size={26} color={theme.subtext} />
              </Pressable>
            </View>

            {items.map((item) => (
              <SidebarItem
                key={item.route}
                route={item.route}
                icon={item.icon}
                iconActive={item.iconActive}
                label={item.label}
                active={isActive(item.route)}
                theme={theme}
                onPress={() => handleNavigate(item.route)}
              />
            ))}
          </Animated.View>
        </View>
      )}
    </>
  )
}
