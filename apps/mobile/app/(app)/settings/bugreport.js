import { View, Text, KeyboardAvoidingView, Platform, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { makeStyles } from '../../../assets/uiStyles'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { insertReport } from '../../../lib/supabase/reports'
import * as Device from 'expo-device'
import * as Application from 'expo-application'

export default function BugReport(){
    const { colors: theme } = useThemeColors();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const router = useRouter();
    const { t } = useTranslation();

    const [formData, setFormData]   = useState({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () =>{
        if (!formData.message || !formData.message.trim()) {
            global.showSnackbar(t('configuration.bugreport.message-empty'), 3000, theme.coral);
            return;
        }
        setLoading(true);
        const deviceInfoJSON = {
            os:  Device.osName,
            os_version: Device.osVersion,
            brand: Device.brand,
            model: Device.modelName,
        }
        const { error } = await insertReport({deviceInfoJSON, app_version:Application.nativeApplicationVersion, message:formData.message});
        if (error) {
            global.showSnackbar(t('configuration.bugreport.error'), 3000, theme.coral);
            setLoading(false);
            return;
        }
        setLoading(false);
        router.replace('/settings/bugreportconfirmation');
    }

    return(
        <>
        <Stack.Screen 
        options={{
            title: t('configuration.bugreport.title'),
            headerRight:()=>(
                loading ? <ActivityIndicator size="small" color={theme.text} /> : <Pressable onPress={handleSubmit}>
                        <Ionicons name="send" size={24} color={theme.text}/>
                </Pressable>
            )
        }}
        />
        <KeyboardAvoidingView 
              style={styles.container}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={100}
            >
            <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>{t('configuration.bugreport.messageLabel')}</Text>
                <TextInput
                placeholder={t('configuration.bugreport.messagePlaceholder')}
                value={formData.message}
                onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                style={styles.textInput}
                placeholderTextColor={theme.subtext}
                multiline
                numberOfLines={10}
                />
            </View>
        </KeyboardAvoidingView>
        </>
    )
}