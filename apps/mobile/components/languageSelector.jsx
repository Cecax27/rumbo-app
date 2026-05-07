import { View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <View style={{flexDirection:'row', gap:22, marginTop:22}}>
        <TouchableOpacity onPress={()=>i18n.changeLanguage('en')}>
            <Image source={require('../assets/icons/usa.png')} style={{width:32, height:32}}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>i18n.changeLanguage('es')}>
            <Image source={require('../assets/icons/mexico.png')} style={{width:32, height:32}}/>
        </TouchableOpacity>
    </View>
  )
}