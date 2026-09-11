import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { makeStyles } from '../../../assets/uiStyles'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../../components/input'
import Button from '../../../components/button'
import { supabase } from '../../../lib/supabase/client'
import { updateProfile } from '../../../lib/supabase/auth'

export default function EditProfile() {
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setFullName(profile?.full_name || '');
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      global.showSnackbar(t('editProfile.name-empty'), 3000, theme.coral);
      return;
    }
    setLoading(true);
    const { error } = await updateProfile({ full_name: fullName.trim() });
    setLoading(false);
    if (error) {
      global.showSnackbar(t('editProfile.error'), 3000, theme.coral);
      return;
    }
    global.showSnackbar(t('editProfile.success'), 3000, theme.primary);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: t('editProfile.title') }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Input
            label={t('editProfile.name')}
            placeholder={t('editProfile.namePlaceholder')}
            value={fullName}
            onChange={(text) => setFullName(text)}
            autoCapitalize="words"
          />
          <Button
            title={t('editProfile.save')}
            loading={loading}
            disabled={loading}
            onPress={handleSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
