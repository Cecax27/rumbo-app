import { View, Pressable, Text, Image, FlatList } from 'react-native'
import { useBudget } from '../../hooks/useBudget'
import { useThemeColors } from '../../theme/useThemeColors'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { t } from 'i18next'
import { MaterialIcons } from '@expo/vector-icons';

export function BudgetPlans() {
    const { budgetPlans, fetchBudgetPlans } = useBudget();
    const { colors } = useThemeColors();

    const router = useRouter()

    useEffect(() => { fetchBudgetPlans(); }, [fetchBudgetPlans])

    return (
        <>
        {budgetPlans.length === 0 && <View style={{flex:1, backgroundColor:colors.background, paddingTop:20, padding:20, alignItems:'center', gap:20}}>
            <MaterialIcons name="search-off" size={64} color={colors.subtext}/>
            <Text style={{fontFamily:'Montserrat-Regular', fontSize:12, textAlign:'center', color:colors.subtext}}>
              {t('dashboard.noBudgetPlans')}
            </Text>
          </View>}
        <FlatList
            data={budgetPlans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <Pressable
                    style={{backgroundColor:colors.surface, borderRadius:10, padding:15, marginBottom:15, elevation:1}}
                    onPress={() => router.push(`/dashboard/budgetDetails/${item.id}`)}
                >
                    <View style={{flexDirection:'column', alignItems:'flex-start'}}>
                        <Image source={require("../../assets/icons/budget.png")} style={{width:64, height:64, position:'absolute', top:5, right:5, opacity:0.5}}/>
                        <Text style={{fontSize:10, fontFamily:'Montserrat-Regular', color:colors.subtext, marginBottom:5}}>{t(`budget.types.${item.period_type}`)}</Text>
                        <Text style={{fontSize:16, fontFamily:'Quicksand-Bold', color:colors.mint, marginBottom:5}}>{item.name}</Text>
                        <Text style={{color:colors.text}}></Text>
                    </View>
                </Pressable>
            )}
        />
        </>
    );
}