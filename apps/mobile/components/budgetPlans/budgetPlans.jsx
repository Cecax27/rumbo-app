import { View, Pressable, Text, Image, FlatList } from 'react-native'
import { useBudget } from '../../hooks/useBudget'
import { useTheme } from '../../theme/useTheme'
import { makeStyles } from '../../assets/uiStyles'
import { useMemo, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { t } from 'i18next'
import { MaterialIcons } from '@expo/vector-icons';

export function BudgetPlans() {
    const { budgetPlans, fetchBudgetPlans } = useBudget();
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const router = useRouter()

    useEffect(() => { fetchBudgetPlans(); }, [fetchBudgetPlans])

    return (
        <>
        {budgetPlans.length === 0 && <View style={[styles.container, {alignItems:'center', gap:20}]}>
            <MaterialIcons name="search-off" size={64} color={theme.subtext}/>
            <Text style={[styles.p, {textAlign:'center', color:theme.subtext}]}>
              {t('dashboard.noBudgetPlans')}
            </Text>
          </View>}
        <FlatList
            data={budgetPlans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <Pressable
                    style={styles.toolCard}
                    onPress={() => router.push(`/dashboard/budgetDetails/${item.id}`)}
                >
                    <View style={styles.toolCardContent}>
                        <Image source={require("../../assets/icons/budget.png")} style={styles.toolIcon}/>
                        <Text style={styles.toolTitle}>{item.name}</Text>
                        <Text style={styles.toolSubtitle}>{t(`budget.types.${item.period_type}`)}</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.text }]}></Text>
                    </View>
                </Pressable>
            )}
        />
        </>
    );
}