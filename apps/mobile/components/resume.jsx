import { View, Text, Alert, StyleSheet} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { getMonthlyBalance, getMonthlyIncomes, getMonthlySpendings } from '../lib/supabase/transactions'
import { useTheme } from "../theme/useTheme";


export default function Resume() {
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]); 

    const [monthBalance, setMonthBalance] = useState(0.0)
    const [incomes, setIncomes] = useState(0.0)
    const [spendings, setSpendings] = useState(0.0)
    const [percentage, setPercentage] = useState(0.0)
    
    useEffect(() => {
            const getData = async () => {
                
                getMonthlyBalance().then(({ data, error }) => {
                  if (error) Alert.alert(error.message)
                  else {
                    setMonthBalance(data)
                  }
                })
                getMonthlyIncomes().then(({ data, error }) => {
                  if (error) Alert.alert(error.message)
                  else {
                    setIncomes(data)
                  }
                })
                getMonthlySpendings().then(({ data, error }) => {
                  if (error) Alert.alert(error.message)
                  else {
                    setSpendings(data)
                  }
                })
            }
            getData().then(setPercentage((incomes - spendings) / incomes * 100))
            
          }, []);

    useEffect(() => {
        setPercentage((incomes - spendings) / incomes * 100)
    }, [incomes, spendings])
      
    return (
        <View style={styles.resumeContainer}>
            <Text style={styles.monthBalance}>
                ${monthBalance?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.percentage}>
                {percentage.toFixed(1)}% left
            </Text>
            <View style={styles.detailsContainer}>
                <View style={styles.detailContainer}>
                    <Text style={styles.label}>
                        Incomes
                    </Text>
                    <Text style={styles.incomes}>
                        ${incomes?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Text>
                </View>
                <View>
                    <Text style={styles.label}>
                        Spendings
                    </Text>
                    <Text style={styles.spendings}>
                        ${spendings?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function makeStyles(theme){ 
    return StyleSheet.create({
    resumeContainer:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    monthBalance:{
        fontSize: 48,
        fontFamily: 'Montserrat-SemiBold',
        color: theme.text,
    }, 
    percentage:{
        fontSize: 18,
        color: theme.primary
    },
    incomes:{
        fontSize: 24, 
        fontFamily: 'Montserrat-SemiBold',
        color: theme.text,
    },
    spendings:{
        fontSize: 24,
        fontFamily: 'Montserrat-SemiBold',
        color: theme.text,    
    },
    detailsContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    detailContainer:{
        width: '50%',

    },
    label:{
        fontSize: 18,
        color:theme.subtext,
        opacity:.4
    }
})}