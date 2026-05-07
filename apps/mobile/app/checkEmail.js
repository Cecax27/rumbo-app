import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, {useMemo} from 'react'
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function CheckEmail() {
    const {t} = useTranslation()
    const {theme} = useTheme();
    const styles = useMemo(()=>makeStyles(theme), [theme]);

    const router = useRouter();

  return (
    <View style={styles.container}>
        <View style={[styles.centeredView, {gap:22}]}>
            <Image 
            source={require('../assets/icon.png')}
            style={{width:100, height:100}}/>
            <Text style={[styles.h1, {textAlign:'center'}]}>{t('check-email.title')}</Text>
            <Text style={[styles.h2, {textAlign:'center'}]}>{t('check-email.subtitle')}</Text>
            <Text style={[styles.label, {textAlign:'center'}]}>{t('check-email.help')}</Text>
            <TouchableOpacity style={[styles.button, {backgroundColor:theme.mint}]} onPress={() => router.push("/")}>
                <Text style={styles.buttonText}>
                {t('check-email.button')}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}