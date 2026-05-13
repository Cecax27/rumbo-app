import '../i18n'; // importante importar ANTES que App
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import 'react-native-url-polyfill/auto'
import Auth from '../components/auth'
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase/client'
import { useRouter } from 'expo-router'
import { makeStyles } from '../assets/uiStyles'
import { useThemeColors } from '../theme/useThemeColors'
import { checkWelcomeSeen } from '../lib/welcomeSeen';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/languageSelector';
const logo = require('../assets/icon.png')

export default function Index() {
  const { t } = useTranslation();
  const { colors: theme, isDark } = useThemeColors()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const router = useRouter()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    setLoading(false);
    if (session) {
      checkWelcomeSeen()
        .then((welcomeSeen) => {
          if (welcomeSeen) { router.replace('/(tabs)/') }
          else { router.replace('/welcome') }
        })
        .catch((error) => console.log(error))
    }
  }, []);


  return (
    <View className='bg-background dark flex-1 flex-col items-center justify-start'>
      <Image source={require('../assets/images/header-login.png')} className='w-full h-1/3' />
      <View className='flex-row items-center gap-3 mt-10 mb-6'>
        <Image source={logo} className='w-12 h-12' />
        <Text className='font-quicksand-bold text-4xl'>Rumbo</Text>
      </View>
      {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />}
      {!loading && <>
        <Auth />
        <StatusBar barStyle={isDark ? 'dark-content' : 'light-content'} />
      </>}
      <LanguageSelector />
    </View>
  );
}
