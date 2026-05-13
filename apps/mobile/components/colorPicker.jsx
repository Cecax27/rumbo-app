import { View, Text, TouchableOpacity } from 'react-native'
import { useThemeColors } from '../theme/useThemeColors'
import { useTranslation } from 'react-i18next'
import { ACCOUNT_COLORS } from '../constants/colors'

export default function ColorPicker({value, onPress}) {
    const { colors } = useThemeColors();
    const {t} = useTranslation();

    return (
        <View style={{marginBottom:20, width:'100%'}}>
            <Text style={{fontSize:12, fontFamily:'Montserrat-Regular', marginBottom:8, color:colors.subtext}}>{t('newAccount.color')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

            {ACCOUNT_COLORS.map(color => (
                <TouchableOpacity
                key={color}
                onPress={() => onPress(color)}
                style={[{ backgroundColor: color, width: 30, height: 30, margin: 5, borderRadius: 20 }, 
                    {borderWidth:value===color?2:0, borderColor:colors.text}
                ]}
                />
            ))}
            </View>
        </View>
    )
}