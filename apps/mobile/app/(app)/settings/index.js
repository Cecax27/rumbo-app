import { View, Text, Pressable, Alert, ScrollView, Image } from 'react-native'
import { makeStyles } from '../../../assets/uiStyles'
import PageContainer from '../../../components/layout/PageContainer'
import { supabase } from '../../../lib/supabase/client'
import { signOut as supabaseSignOut, deleteAccount } from '../../../lib/supabase/auth'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'


const SettingItem = ({ icon, title, onPress, rightComponent, titleStyle = {} , hideArrow = false}) => {
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  
  return (
    <Pressable 
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'transparent',
        opacity: 1,
      }}
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
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() =>  makeStyles(theme), [theme]);
  const { t, i18n} = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setFullName(profile?.full_name || '');
      }
    };
    
    loadUser();
  }, []);

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
            const { error } = await supabaseSignOut();
            if (error) {
              global.showSnackbar(t('configuration.signOutError'), 3000, theme.coral);
            } else {
              router.replace('/');
            }
          },
          style: 'destructive',
        },
      ]
    );
  }

  function confirmDeleteAccount() {
    Alert.alert(
      t('deleteAccount.title'),
      t('deleteAccount.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('deleteAccount.delete'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              global.showSnackbar(t('deleteAccount.error'), 3000, theme.coral);
            } else {
              router.replace('/');
            }
          },
        },
      ]
    );
  }

  const displayName = fullName || user?.user_metadata?.full_name || user?.email || t('configuration.guestUser');

  return (
    <PageContainer>
    <ScrollView style={{flex:1, backgroundColor:theme.background}}>
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
                {displayName.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>
          {displayName}
        </Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('configuration.appSettings')}</Text>
        <View style={styles.sectionContent}>
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
            onPress={() => {router.push('/settings/editProfile')}}
            />
          <View style={styles.divider} />
          <SettingItem
            icon={<Ionicons name="lock-closed" size={24} color={theme.subtext} />}
            title={t('configuration.changePassword')}
            onPress={() => {router.push('/settings/changePassword')}}
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
            onPress={() => {router.push('/settings/bugreport')}}
            />
        </View>
      </View>

      {/* Support Section */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionContent}>
          <SettingItem
            icon={<Ionicons name="trash" size={24} color={theme.error} />}
            title={t('configuration.deleteAccount')}
            titleStyle={{ color: theme.error }}
            onPress={confirmDeleteAccount}
            />
          <View style={styles.divider} />
          <SettingItem
            icon={<Ionicons name="log-out" size={24} color={theme.subtext} />}
            title={t('configuration.signOut')}
            titleStyle={{ color: theme.error }}
            onPress={signOut}
            />
        </View>
      </View>
    </ScrollView>
    </PageContainer>
  );
}
