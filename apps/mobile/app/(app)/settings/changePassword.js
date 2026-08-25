import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { makeStyles } from '../../../assets/uiStyles'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../../components/input'
import Button from '../../../components/button'
import { changePassword } from '../../../lib/supabase/auth'

export default function ChangePassword() {
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword) {
      global.showSnackbar(t('changePassword.current-password-empty'), 3000, theme.coral);
      return;
    }
    if (newPassword.length < 8) {
      global.showSnackbar(t('signup.errors.short-password'), 3000, theme.coral);
      return;
    }
    if (newPassword !== confirmPassword) {
      global.showSnackbar(t('signup.errors.password-no-match'), 3000, theme.coral);
      return;
    }
    setLoading(true);
    const { error } = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (error) {
      if (error.code === 'invalid_credentials' || error.code === 'invalid_grant') {
        global.showSnackbar(t('changePassword.wrong-current-password'), 3000, theme.coral);
      } else {
        global.showSnackbar(t('changePassword.error'), 3000, theme.coral);
      }
      return;
    }
    global.showSnackbar(t('changePassword.success'), 3000, theme.primary);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: t('changePassword.title') }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Input
            label={t('changePassword.currentPassword')}
            placeholder={t('changePassword.currentPasswordPlaceholder')}
            value={currentPassword}
            onChange={(text) => setCurrentPassword(text)}
            secureTextEntry={true}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
          />
          <Input
            label={t('changePassword.newPassword')}
            placeholder={t('changePassword.newPasswordPlaceholder')}
            value={newPassword}
            onChange={(text) => setNewPassword(text)}
            secureTextEntry={true}
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
          />
          <Input
            label={t('changePassword.confirmPassword')}
            placeholder={t('changePassword.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(text) => setConfirmPassword(text)}
            secureTextEntry={true}
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
          />
          <Button
            title={t('changePassword.button')}
            loading={loading}
            disabled={loading}
            onPress={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
