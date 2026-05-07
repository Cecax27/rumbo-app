import { View, Text, Pressable, Alert, ScrollView, Image } from 'react-native'
import { makeStyles } from '../../../assets/uiStyles'
import { supabase } from '../../../lib/supabase/client'
import { useRouter, Stack } from 'expo-router'
import { useTheme } from '../../../theme/useTheme'
import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'


const SettingItem = ({ icon, title, onPress, rightComponent, titleStyle = {} , hideArrow = false}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  
  return (
    <Pressable 
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <Text style={[styles.settingText, titleStyle]}>{title}</Text>
      <View style={{ flex: 1 }} />
      {rightComponent}
      {!hideArrow && <Ionicons name="chevron-forward" size={20} color={theme.subtext} />}
    </Pressable>
  );
};

export default function Configuration() {
  const { theme, toggle } = useTheme();
  const styles = useMemo(() =>  makeStyles(theme), [theme]);
  const { t, i18n} = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(theme.dark);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    toggle();
  };

  async function signOut() {
    Alert.alert(
      t('configuration.signOutConfirm.title'),
      t('configuration.signOutConfirm.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.signOut'),
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert(t('configuration.signOutError'));
            } else {
              router.replace('/signUp');
            }
          },
          style: 'destructive',
        },
      ]
    );
  }



  return (
    <>
    <Stack.Screen 
    options={{
        title: t('configuration.title'),
    }}
    />
    <ScrollView style={styles.fullContainer}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user?.user_metadata?.avatar_url ? (
            <Image 
            source={{ uri: user.user_metadata.avatar_url }} 
            style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>
          {user?.user_metadata?.full_name || user?.email || t('configuration.guestUser')}
        </Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('configuration.appSettings')}</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon={<Ionicons name="moon" size={24} color={theme.subtext} />}
            title={t('configuration.darkMode')}
            onPress={handleThemeToggle}
            rightComponent={
              <Ionicons 
              name={isDarkMode ? 'bulb' : 'bulb-outline'} 
              size={24} 
              color={theme.subtext} 
              />
            }
            hideArrow
            />
          <View style={styles.divider} />
          <SettingItem
            icon={<Ionicons name="language" size={24} color={theme.subtext} />}
            title={t('configuration.language')}
            onPress={() => {i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}}
            rightComponent={
              <Text style={styles.languageText}>
                {t(`common.language.${i18n.language}`)}
              </Text>
            }
            />
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('configuration.account')}</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon={<Ionicons name="person" size={24} color={theme.subtext} />}
            title={t('configuration.editProfile')}
            onPress={() => {}}
            />
          <View style={styles.divider} />
          <SettingItem
            icon={<Ionicons name="notifications" size={24} color={theme.subtext} />}
            title={t('configuration.notifications')}
            onPress={() => {}}
            />
          <View style={styles.divider} />
          <SettingItem
            icon={<Ionicons name="help-circle" size={24} color={theme.subtext} />}
            title={t('configuration.help')}
            onPress={() => {}}
            />
          <SettingItem
            icon={<Ionicons name="bug" size={24} color={theme.subtext} />}
            title={t('configuration.bugreport.title')}
            onPress={() => {router.push('/configuration/bugreport')}}
            />
        </View>
      </View>

      {/* Support Section */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionContent}>
          <SettingItem
            icon={<Ionicons name="log-out" size={24} color={theme.subtext} />}
            title={t('configuration.signOut')}
            titleStyle={{ color: theme.error }}
            onPress={signOut}
            />
        </View>
      </View>
    </ScrollView>
    </>
  );
}