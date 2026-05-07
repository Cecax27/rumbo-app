import { View, Text, TouchableOpacity } from 'react-native'
import { useMemo} from 'react'
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'
import { useTranslation } from 'react-i18next'
import { ACCOUNT_COLORS } from '../constants/colors'

export default function ColorPicker({value, onPress}) {
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const {t} = useTranslation();

    return (
        <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t('newAccount.color')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

            {ACCOUNT_COLORS.map(color => (
                <TouchableOpacity
                key={color}
                onPress={() => onPress(color)}
                style={[{ backgroundColor: color, width: 30, height: 30, margin: 5, borderRadius: 20 }, 
                    {borderWidth:value===color?2:0, borderColor:theme.text}
                ]}
                />
            ))}
            </View>
        </View>
    )
}