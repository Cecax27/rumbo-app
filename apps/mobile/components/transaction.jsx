import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatCurrency } from '../lib/utils';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../theme/useThemeColors';

export default function Transaction ({icon, description, account, amount, color, id, type, to_account=null}) {
  const router = useRouter();

  const { colors } = useThemeColors();

  return (
    <TouchableOpacity onPress={() => {router.push({pathname: `/transactions/details/${id}`, params: {type}})}}>
    <View style={styles.container}>
      <MaterialIcons name={ icon } style={[styles.icon, { borderColor: color, backgroundColor: colors.background }]} size={28} color={color}/>
      <View style={styles.info}>
        <Text style={[styles.description, { color: colors.text }]}> 
          {description}
        </Text>
        <Text style={[styles.account, { color: colors.text }]}> 
          {account}{to_account ? ` → ${to_account}` : ''}
        </Text>
      </View>
      <Text style={[styles.amount, type==='income' ? {color:colors.income} : {color:colors.spending}]}> 
        {(type==='income' ? '+ ' : '- ' )+ formatCurrency(amount)}
      </Text>
    </View> 
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    marginBottom: 22,
  },
  description: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  account: {
    fontFamily:'Montserrat-Regular',
    fontSize: 12,
    opacity:.6
  },
  info: {
    justifyContent: 'center',
    flexGrow: 1,
    marginLeft:12 
  },
  icon: {
    height: 42,
    width: 42,
    resizeMode: 'center',
    padding:6,
  },
  amount:{
    fontSize:14,
    fontFamily:'Montserrat-Medium',
  }
});
