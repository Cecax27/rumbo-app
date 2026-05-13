import { Text, View } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

export default function DateGroup ({date, children}) {
  const { colors } = useThemeColors();

  return (
    <View>
      <Text
        className="mb-6"
        style={{
          fontSize: 12,
          fontFamily: 'Montserrat-Regular',
          color: colors.subtext,
          opacity: 0.4,
        }}
      >
        {date}
      </Text>
      <View style={{ gap: 28 }}>
        {children}
      </View>
    </View>
  );
}
