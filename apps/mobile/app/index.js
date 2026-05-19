import '../i18n'; // importante importar ANTES que App
import { Text, View, Image, ActivityIndicator } from 'react-native';
import 'react-native-url-polyfill/auto'
import Auth from '../components/auth'
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../theme/useThemeColors'
import { checkWelcomeSeen } from '../lib/welcomeSeen';
import LanguageSelector from '../components/languageSelector';
const logo = require('../assets/icon.png')

export default function Index() {
  const { colors: theme } = useThemeColors()
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
    <View className='bg-background flex-1 flex-col items-center justify-start dark:bg-black'>
      <Image source={require('../assets/images/header-login.png')} className='w-full h-1/3' />
      <View className='flex-row items-center gap-3 mt-10 mb-6'>
        <Image source={logo} className='w-12 h-12' />
        <Text className='font-quicksand-bold text-4xl text-black dark:text-white'>Rumbo</Text>
      </View>
      {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />}
      {!loading && <>
        <Auth />
      </>}
      <LanguageSelector />
    </View>
  );
}
