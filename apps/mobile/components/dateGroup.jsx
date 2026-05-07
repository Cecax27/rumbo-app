import { Text, View, StyleSheet, Image } from 'react-native';
import { useTheme } from '../theme/useTheme';

export default function DateGroup ({date, children}) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.date, { color: theme.subtext }]}>
        {date}
      </Text>
      <View style={styles.cards}>
      {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'left',
    justifyContent: 'top',
  },
  date: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'Montserrat, Segoe-UI, Sans-Serif',
    color: "0c0c0c",
    opacity: .4,
    marginBottom: 22
  },
  cards: {
    flexDirection: 'column',
    gap:28
  }
  
});
