import {Tabs} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import * as Font from 'expo-font';
import { useEffect, useState, useMemo } from 'react';
import 'react-native-url-polyfill/auto'
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from 'react-i18next';

const logo = require('../../assets/icon.png')

const home_active = require('../../assets/icons/home.png')
const home_inactive = require('../../assets/icons/home_inactive.png')

export default function TabsLayout() {
  const { theme, effectiveScheme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Quicksand-Regular': require('../../assets/fonts/Quicksand-Regular.ttf'),
        'Quicksand-Bold': require('../../assets/fonts/Quicksand-Bold.ttf'),
        'Quicksand-SemiBold': require('../../assets/fonts/Quicksand-SemiBold.ttf'),
        'Quicksand-Medium': require('../../assets/fonts/Quicksand-Medium.ttf'),
        'Quicksand-Light': require('../../assets/fonts/Quicksand-Light.ttf'),
        'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
        'Montserrat-Regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Medium': require('../../assets/fonts/Montserrat-Medium.ttf'),
      });
      setFontLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontLoaded) {
    return null;
  }

  return (
    <>
    <Tabs
      initialRouteName='dashboard'
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.background, elevation: 10},
        headerStyle: { backgroundColor: theme.background, elevation: 10 },
        headerTitleStyle: { color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 16 },
        headerTitleAlign: 'center',
        tabBarLabelStyle: { fontSize: 12, fontFamily: 'Quicksand-Medium', marginBottom: 5,  },
        tabBarIconStyle: { marginTop: 5 },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
      }}>
        <Tabs.Screen
        name="index"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
      name="dashboard"
      options={{
        title: t('tabs.dashboard'),
        tabBarIcon: ({focused}) => <Image source={focused ? home_active : home_inactive} style={{width:32, height:32}} />, 
        headerTitle: t('tabs.dashboard'),
        headerShown: false
      }} />
      <Tabs.Screen
      name="transactions"
      options={{
        title: t('tabs.transactions'),
        tabBarIcon: ({color}) => <MaterialIcons name={ "payments" } size={32} color={color}/> ,
        headerTitle: t('tabs.transactions'),
        headerShown: true
      }} />
      <Tabs.Screen
      name="accounts"
      options={{
        title: t('tabs.accounts'),
        tabBarIcon: ({color}) => <MaterialIcons name={ "wallet" } size={32} color={color}/> ,
        headerTitle: t('tabs.accounts'),
        headerShown: false
      }} />
      <Tabs.Screen
      name="configuration"
      options={{
        title: t('tabs.settings'),
        tabBarIcon: ({color}) => <MaterialIcons name={ "settings" } size={32} color={color}/> ,
        headerTitle: t('tabs.settings'),
        headerShown: false
      }} />
    </Tabs>
    <StatusBar style={effectiveScheme} />
    </>
  );
}

function makeStyles(theme) { 
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  icon: {
    height: 47,
    width: 47,
    resizeMode: 'center',
  },
})}
