import { View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useThemeColors } from '../theme/useThemeColors';

export default function FloatActionButton({ children, content }) {
    const { colors } = useThemeColors();
    const [open, setOpen] = useState(false);

  return (
        <View className="absolute bottom-5 right-5 items-end" style={{ gap: 10 }}>
            <View style={{ display: open ? 'flex' : 'none', gap: 10, alignItems: 'flex-end' }}>
        { children }
            </View>
            <TouchableOpacity
                style={{ backgroundColor: colors.mint, padding: 15, borderRadius: 100, alignItems: 'center', marginTop: 15, elevation: 10 }}
        onPress={() => setOpen(!open)}>
                { content }
            </TouchableOpacity>
    </View>
    );
}

function Item({ content, onPress }) {
    const { colors } = useThemeColors();

    return (
        <TouchableOpacity
            style={{ backgroundColor: colors.mint, padding: 15, borderRadius: 100, alignItems: 'center', elevation: 10 }}
            onPress={onPress}
        >
            { content }
        </TouchableOpacity>
    );
}

FloatActionButton.Item = Item;