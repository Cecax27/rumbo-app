import { View, Text, TouchableOpacity } from 'react-native'
import { useThemeColors } from '../theme/useThemeColors'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ACCOUNT_ICONS } from '../constants/icons'


export default function IconPicker({value, onPress, activeColor}) {
    const { colors } = useThemeColors();
    const {t} = useTranslation();

    return (
        <View style={{marginBottom:20, width:'100%'}}>
            <Text style={{fontSize:12, fontFamily:'Montserrat-Regular', marginBottom:8, color:colors.subtext}}>{t('newAccount.icon')}</Text>
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
                            backgroundColor: value === icon.name ? (activeColor??colors.text) : colors.surface
                        }}
                    >
                        <Icon name={icon.name} size={24} color={colors.text} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}