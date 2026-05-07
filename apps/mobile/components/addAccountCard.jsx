import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons';

import styles from '../assets/uiStyles'

export function AddAccountCard ({ onClick }) {

    return (
        <TouchableOpacity onPress={onClick}>
            <View style={[accountStyles.card]}>
                <MaterialIcons name={'add'} size={42} style={accountStyles.icon} color={'#0c0c0c'}/>
            </View>
        </TouchableOpacity>
    )
}

export default AddAccountCard

const accountStyles = StyleSheet.create({
    card:{
        width: 173,
        height: 254,
        borderRadius: 10,
        backgroundColor: '#c2bb00',
        opacity: .21,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        opacity: 1,
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