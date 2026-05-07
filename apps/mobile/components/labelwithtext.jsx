import { View, Text } from 'react-native'
import React, {useMemo} from 'react'
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'

export default function LabelWithText({ label, text }) {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <View style={{marginBottom:12, gap:4}}>
      <Text style={styles.label}>{label}</Text>
        <Text style={styles.p}>{text}</Text>
    </View>
  )
}