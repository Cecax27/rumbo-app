import { View, Text, Alert } from "react-native";
import { useState, useEffect } from "react";
import { getMonthlyBalance, getMonthlyIncomes, getMonthlySpendings } from '../lib/supabase/transactions'
import { useThemeColors } from "../theme/useThemeColors";


export default function Resume() {
    const { colors } = useThemeColors();

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
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <Text style={{fontSize:48, fontFamily:'Montserrat-SemiBold', color:colors.text}}>
                ${monthBalance?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </Text>
            <Text style={{fontSize:18, color:colors.primary}}>
                {percentage.toFixed(1)}% left
            </Text>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <View style={{width:'50%'}}>
                    <Text style={{fontSize:18, color:colors.subtext, opacity:.4}}>
                        Incomes
                    </Text>
                    <Text style={{fontSize:24, fontFamily:'Montserrat-SemiBold', color:colors.text}}>
                        ${incomes?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Text>
                </View>
                <View>
                    <Text style={{fontSize:18, color:colors.subtext, opacity:.4}}>
                        Spendings
                    </Text>
                    <Text style={{fontSize:24, fontFamily:'Montserrat-SemiBold', color:colors.text}}>
                        ${spendings?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Text>
                </View>
            </View>
        </View>
    )
}

