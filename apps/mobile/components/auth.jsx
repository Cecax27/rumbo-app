import React, { useState, useMemo } from 'react'
import { Alert, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { signIn } from '../lib/supabase/auth'
import { Link, useRouter } from 'expo-router'
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'
import { checkWelcomeSeen } from '../lib/welcomeSeen'
import { useTranslation } from 'react-i18next';

export default function Auth() {
const {theme} = useTheme()
const styles = useMemo(() => makeStyles(theme), [theme])
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
    {loading && <ActivityIndicator size="large" color={theme.primary} style={{marginTop:40}}/>}
    {!loading && <KeyboardAvoidingView 
          style={{justifyContent: 'center', alignItems: 'center'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={100}
          >
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[styles.p, {marginTop: 22}]}>
          {t('shared.email')}
        </Text>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="luke@jedi.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          autoComplete="username"
          textContentType="emailAddress"
          style={[styles.textInput, {width:250}]}
          placeholderTextColor={theme.subtext}
          textAlign="center"
          accessibilityLabel="Email input"
          />
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
        <Text style={styles.p}>
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
          style={[styles.textInput, {width:250}]}
          placeholderTextColor={theme.subtext}
          textAlign="center"
          accessibilityLabel="Password input"
          />
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
        <Pressable 
        disabled={loading} 
        onPress={() => signInWithEmail()} 
        style={styles.button}>
          <Text style={styles.buttonText}>{t('login.button')}</Text>
        </Pressable>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
        <Link href="/signUp">
          <Text style={{ color: theme.primary, fontFamily: 'Montserrat-SemiBold'}}>{t('login.create-account')}</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>}
    </>
  )
}