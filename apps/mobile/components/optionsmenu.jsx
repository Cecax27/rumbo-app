import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default function OptionsMenu({children}) {
  return (
    <View style={styles.optionsMenu}>
        { children}
    </View>
  )
}

function Item({ icon, color, onPress,}) {
  return (
    <TouchableOpacity onPress={ onPress }>
        <Icon name={ icon } size={20} color={ color }/>
    </TouchableOpacity>
  )
}

OptionsMenu.Item = Item;

const styles = StyleSheet.create({
    optionsMenu: {
        gap: 15,
        flexDirection:'row',
        justifyContent: 'flex-end'
    },
})