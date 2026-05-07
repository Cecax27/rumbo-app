import { View, Text, TouchableOpacity } from 'react-native'
import { useMemo} from 'react'
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ACCOUNT_ICONS } from '../constants/icons'


export default function IconPicker({value, onPress, activeColor}) {
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const {t} = useTranslation();

    return (
        <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t('newAccount.icon')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 25 }}>
                {ACCOUNT_ICONS.map(icon => (
                    <TouchableOpacity
                        key={icon.name}
                        onPress={() => onPress(icon.name)}
                        style={{ 
                            width: 40, 
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 30,
                            backgroundColor: value === icon.name ? (activeColor??theme.text) : theme.surface
                        }}
                    >
                        <Icon name={icon.name} size={24} color={theme.text} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}