import { View, Text, KeyboardAvoidingView, Platform, TextInput, Pressable } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { makeStyles } from '../../../assets/uiStyles'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'

export default function BugReportConfirmation(){
    const { colors: theme } = useThemeColors();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const router = useRouter();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({})

    return(
        <>
        <Stack.Screen 
        options={{
            title: t('configuration.bugreport.title'),
        }}
        />
        <KeyboardAvoidingView 
              style={styles.container}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={100}
            >
            <Text style={styles.h1}>
                {t('common.thanks')}
            </Text>
            <Text style={styles.p}>
                {t('configuration.bugreport.confirmation')}
            </Text>
        </KeyboardAvoidingView>
        </>
    )
}