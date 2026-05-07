import { Text, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import { useTheme } from '../theme/useTheme'
import { makeStyles } from '../assets/uiStyles'

export default function FButton({ text, onPress, active = true }) {
    const { theme } = useTheme()
    const styles = useMemo(() => makeStyles(theme), [theme])
  return (
    <TouchableOpacity 
        style={[styles.base, active ? styles.active : styles.disable]}
        onPress={ onPress }
    >
        <Text style={ active ? styles.activeText : styles.disableText }>{text}</Text>
    </TouchableOpacity>
    )
}