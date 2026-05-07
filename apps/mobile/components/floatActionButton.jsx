import { View, Text, TouchableOpacity } from 'react-native'
import { makeStyles } from '../assets/uiStyles'
import { useTheme } from '../theme/useTheme'
import { useMemo, useState } from 'react'

export default function FloatActionButton({ children, content }) {
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    
    const [open, setOpen] = useState(false);

  return (
    <View style={{position: 'absolute', bottom: 20, right: 20, gap: 10, alignItems: 'flex-end'}}>
        <View style={{display: open ? 'flex' : 'none', gap: 10, alignItems: 'flex-end'}}>
        { children }
        </View>
        <TouchableOpacity 
        style={{backgroundColor:theme.mint, padding: 15, borderRadius: 100, alignItems: 'center', marginTop: 15, elevation:10}}
        onPress={() => setOpen(!open)}>
            { content }
        </TouchableOpacity>
    </View>
  )
}

function Item({ content, onPress }) {
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    return (
    <TouchableOpacity 
    style={{backgroundColor:theme.mint, padding: 15, borderRadius: 100, alignItems: 'center', elevation: 10}}
    onPress={ onPress }>
        { content }
    </TouchableOpacity>)
}

FloatActionButton.Item = Item;