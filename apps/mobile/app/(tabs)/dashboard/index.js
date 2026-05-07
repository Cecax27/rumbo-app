import { View, Text, Image } from 'react-native'
import { makeStyles } from '../../../assets/uiStyles'
import { useTheme } from '../../../theme/useTheme'
import { useMemo } from 'react'
import { BudgetPlans } from '../../../components/budgetPlans/budgetPlans'
import { SavingGoals } from '../../../components/savingGoals/savingGoals'
import FloatActionButton from '../../../components/floatActionButton'
import { useRouter, Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function Dashboard() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const router = useRouter()

    return (
        <>
        <Stack.Screen
        options={{
          title: t('dashboard.title'),
        }}
      />
        <View style={[styles.container, { backgroundColor: theme.background, color: theme.text }]}> 
            <View style={styles.dashboard}>
                <BudgetPlans />
                <SavingGoals />
            </View>
            <FloatActionButton 
            content={<Image source={require('../../../assets/icons/add_tool.png')} style={{width:24, height:24}} />}>
                <FloatActionButton.Item 
                content={
                    <View style={{flexDirection:'row', gap:10, justifyContent:'center'}}>
                        <Image source={require('../../../assets/icons/add_budget.png')} style={{width:20,  height:20}}/>
                        <Text style={{fontSize:12, fontFamily:'Montserrat-SemiBold'}}>{t('dashboard.newBudget')}</Text>
                    </View>}
                onPress={()=>{router.push('/dashboard/newBudget')}}/>
                <FloatActionButton.Item 
                content={
                    <View style={{flexDirection:'row', gap:10, justifyContent:'center'}}>
                        <Image source={require('../../../assets/icons/budget.png')} style={{width:20,  height:20}}/>
                        <Text style={{fontSize:12, fontFamily:'Montserrat-SemiBold'}}>{t('dashboard.newSavingGoal')}</Text>
                    </View>}
                onPress={()=>{router.push('/dashboard/newSavingGoal')}}/>
            </FloatActionButton>
        </View>
        </>
    )   
}

Dashboard.options = {
    title: 'Dashboard',
    headerShown: true
}