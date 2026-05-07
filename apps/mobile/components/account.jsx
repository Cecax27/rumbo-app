import { Text, View, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { getContrastTextColor, formatCurrency } from '../lib/utils';
import ChipSvg from './svg/chip';

export function Account ({account, isSelected}) {

    const textColor = getContrastTextColor(account.color);

    return (
        <View style={[accountStyles.card, {backgroundColor: account.color, opacity: isSelected ? 1 : 0.5}]}>
            <MaterialIcons name={account.icon} size={22} color={textColor} style={accountStyles.icon}/>
            <Text style={[accountStyles.name, { color: textColor }]}>{account.name}</Text>
            <Text style={[accountStyles.balance, { color: textColor }]}>Balance</Text>
            <Text style={[accountStyles.balanceAmount, { color: textColor }]}>{formatCurrency(account.balance)}</Text>
            <ChipSvg />
        </View>
    )
}

export default Account

const accountStyles = StyleSheet.create({
    card:{
        width: 173,
        height: 254,
        borderRadius: 10,
        padding: 20
    },
    icon: {
        opacity: 0.5
    },
    name: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        marginTop:10
    },
    balance: {
        marginTop: 62,
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
    },
    balanceAmount: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        marginBottom: 10
    }
})