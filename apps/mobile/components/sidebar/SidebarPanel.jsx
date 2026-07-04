import {
  View,
  Pressable,
  Modal,
  Image,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeColors } from '../../theme/useThemeColors'
import { Ionicons } from '@expo/vector-icons'
import { usePathname, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import SidebarItem from './SidebarItem'

const logo = require('../../assets/icon.png')

export default function SidebarPanel({ visible, onClose }) {
  const { colors: theme } = useThemeColors()
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleNavigate = useCallback(
    (route) => {
      onClose()
      setTimeout(() => {
        router.push(route)
      }, 200)
    },
    [onClose, router]
  )

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
        </TouchableWithoutFeedback>

        <View
          style={{
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingHorizontal: 16,
          }}
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
            <Pressable onPress={onClose} hitSlop={8}>
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
        </View>
      </View>
    </Modal>
  )
}
