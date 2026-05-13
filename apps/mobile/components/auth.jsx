import React, { useState } from 'react'
import { Alert, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { signIn } from '../lib/supabase/auth'
import { Link, useRouter } from 'expo-router'
import { useThemeColors } from '../theme/useThemeColors'
import { checkWelcomeSeen } from '../lib/welcomeSeen'
import { useTranslation } from 'react-i18next';

export default function Auth() {
const { colors } = useThemeColors()
const { t } = useTranslation();

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await signIn(email, password)

    if (error) Alert.alert(error.message)
    else {
      checkWelcomeSeen()
      .then((welcomeSeen)=>{
        if(welcomeSeen) { router.replace('/(tabs)/')}
        else { router.replace('/welcome')}
      })
      .catch((error)=>console.log(error))
    }
    setLoading(false)
  
  }

  return (
    <>
    {loading && <ActivityIndicator size="large" color={colors.primary} style={{marginTop:40}}/>}
    {!loading && <KeyboardAvoidingView 
          style={{justifyContent: 'center', alignItems: 'center'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={100}
          >
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text className='text-left w-full text-sm mb-1 font-body-semibold'>
          {t('shared.email')}
        </Text>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@example.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          autoComplete="username"
          textContentType="emailAddress"
          className='input'
          textAlign="center"
          accessibilityLabel="Email input"
          />
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
        <Text style={{fontSize:12, fontFamily:'Montserrat-Regular', color:colors.subtext}}>
          {t('shared.password')}
        </Text>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="*********"
          autoCapitalize={'none'}
          keyboardType="default"
          autoComplete="password"
          textContentType="password"
          className='w-full rounded-full px-4 py-2 mb-4 text-sm font-body text-gray-900 bg-[#e8e8e8]'
          placeholderTextColor={colors.subtext}
          textAlign="center"
          accessibilityLabel="Password input"
          />
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
        <Pressable 
        disabled={loading} 
        onPress={() => signInWithEmail()} 
        className='bg-primary px-4 py-2 rounded-full mt-2 mb-4 flex items-center justify-center'>
          <Text className='text-black font-semibold text-sm'>{t('login.button')}</Text>
        </Pressable>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
        <Link href="/signUp">
          <Text className='text-primary font-semibold'>{t('login.create-account')}</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>}
    </>
  )
}