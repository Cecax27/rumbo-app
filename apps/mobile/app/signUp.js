import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, Alert, Pressable, Keyboard, Vibration, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import 'react-native-url-polyfill/auto'
import React, { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase/client'
import { Link, useRouter } from 'expo-router';
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'
import LanguageSelector from '../components/languageSelector';
import { useTranslation } from 'react-i18next';
import { failIf, validateEmail } from '../lib/utils';
import Input from '../components/input';
import Snackbar from '../components/Snackbar';

const logo = require('../assets/icon.png')

export default function SignUp() {
  const { t } = useTranslation();
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {

    setLoading(true);
    Keyboard.dismiss();
    if (failIf(email === "", t("signup.errors.email-empty"), theme, () => setLoading(false))) return;
    if (failIf(!validateEmail(email), t("signup.errors.email-wrong"), theme, () => setLoading(false))) return;
    if (failIf(password === "", t("signup.errors.password-empty"), theme, () => setLoading(false))) return;
    if (failIf(password.length < 8, t("signup.errors.short-password"), theme, () => setLoading(false))) return;
    if (failIf(password !== passwordConfirmation, t("signup.errors.password-no-match"), theme, () => setLoading(false))) return;
    

    const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
    })
    
    if (error) {
      
      if (error.code === "email_address_invalid"){
        Alert.alert(t('signup.errors.email-wrong'));
      } else {
        Alert.alert(error.message);
      }

      setLoading(false);
      return;
    };
    if (!session) router.replace('checkEmail');
    Vibration.vibrate([0, 400, 300, 800])
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
              style={[styles.container, styles.centeredView]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
              keyboardVerticalOffset={100}
          >
      <Snackbar />
      <Image source={logo} style={styles.logo}/>
      <Text style={styles.title}>{t('signup.title')}</Text>
      {loading && <ActivityIndicator size="large" color={theme.primary} style={{marginTop:40}}/>}
      {!loading && <View style={{justifyContent: 'center', alignItems: 'center', marginTop:22}}>
          <Input 
            label={t('shared.email')}
            placeholder="luke@jedi.com"
            value={email}
            onChange={(text) => setEmail(text)}
            autoCapitalize='none'
            keyboardType='email-address'
            email
            icon='email'
            />
          <Input 
            label={t('shared.password')}
            placeholder={t('signup.password-holder')}
            value={password}
            onChange={(text) => setPassword(text)}
            autoCapitalize='none'
            secureTextEntry={true}
            textContentType='password'
            autoComplete='password-new'
            icon='lock'
            />
          <Input 
            label={t('signup.confirm-password')}
            placeholder={t('signup.confirm-password-holder')}
            value={passwordConfirmation}
            onChange={(text) => setPasswordConfirmation(text)}
            autoCapitalize='none'
            secureTextEntry={true}
            textContentType='password'
            autoComplete='password-new'
            icon='lock-reset'
            />
            <View style={{marginTop:20}}>
              <Pressable 
              disabled={loading} 
              onPress={() => signUpWithEmail()} 
              style={[styles.button, {backgroundColor:theme.mint  }]}>
                <Text style={styles.buttonText}>{t('signup.button')}</Text>
              </Pressable>
            </View>
            <View style={{marginTop:8}}>
              <Link href="/">
                <Text style={{ color: theme.mint, fontFamily: 'Montserrat-SemiBold'}}>{t('signup.have-account')}</Text>
              </Link>
            </View>
          </View>}
        <LanguageSelector />
        
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
