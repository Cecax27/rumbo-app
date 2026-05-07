import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Image, Alert } from 'react-native';
import { Stack, useRouter, useGlobalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ProgressChart } from 'react-native-chart-kit';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../../theme/useTheme';
import { makeStyles } from '../../../../assets/uiStyles';
import { getBudgetPlanDetails, deleteBudget } from '../../../../lib/supabase/tools';
import { formatCurrency, hexToRgba, formatDateToISO } from '../../../../lib/utils';
import { useTranslation } from 'react-i18next';

const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
];

const years = Array.from({ length: 20 }, (_, i) => 2015 + i);
  

export default function BudgetDetails() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const router = useRouter()

    const params = useGlobalSearchParams()

    const [budgetPlan, setBudgetPlan] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [menuVisible, setMenuVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Used in confirmDelete function
    const [weeks, setWeeks] = useState([])
    const [week, setWeek] = useState(0)

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteBudget(params.id);
            router.back();
        } catch (error) {
            console.error('Error deleting budget plan:', error);
            Alert.alert(
                t('common.error'),
                t('budget.alerts.error.message')
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDelete = () => {
        if (isDeleting) return; // Prevent multiple delete attempts
        
        Alert.alert(
            t('budget.delete.title'),
            t('budget.delete.message', { budgetName: budgetPlan?.name || t('budget.title') }),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                    onPress: () => setIsDeleting(false),
                },
                {
                    text: t('budget.delete.delete'),
                    style: 'destructive',
                    onPress: () => {
                        setIsDeleting(true);
                        handleDelete();
                    },
                },
            ]
        );
    };

    useEffect(()=>{        
        function formatWeekLabel(startDate, endDate) {
            const startMonth = months[startDate.getMonth() ];
            const endMonth = months[endDate.getMonth() ];
          
            return `${t(`common.months.${startMonth}`).substring(0, 3)} ${startDate.getDate()} - ${t(`common.months.${endMonth}`).substring(0, 3)} ${endDate.getDate()}`;
        }
        function getWeeksOfMonth(year, month) {
            const weeks = [];
            
            const firstDay = new Date(year, month -1, 1);
            const lastDay = new Date(year, month, 0);
        
            let firstMonday = new Date(firstDay);
            while (firstMonday.getDay() !== 1) {
              firstMonday.setDate(firstMonday.getDate() + 1);
            }
          
            let currentMonday = new Date(firstMonday);
            while (currentMonday <= lastDay) {
              let currentSunday = new Date(currentMonday);
              currentSunday.setDate(currentSunday.getDate() + 6);
          
              if (currentSunday > lastDay) {
                currentSunday = lastDay;
              }
          
              weeks.push({
                startDate: formatDateToISO(currentMonday),
                label: formatWeekLabel(currentMonday, currentSunday)
              });
          
              currentMonday.setDate(currentMonday.getDate() + 7);
            }
          
            return weeks;
        }
        setWeeks(getWeeksOfMonth(year, month))
    }, [month, year, t])

    useEffect(() => {
        const fetchBudgetPlan = async () => {          
            let reference_date = ""
            if (budgetPlan?.period_type === 'week'){
                reference_date = weeks[week-1].startDate;
            } else {
                reference_date = `${year}-${String(month).padStart(2, "0")}-01`;
            }
            
            const data = await getBudgetPlanDetails(params.id, reference_date);
            setBudgetPlan(data);  
        };

        fetchBudgetPlan();
    }, [params.id, year, month, week, weeks]);

  return (
        <>
        <Stack.Screen 
        options={{ 
            title: t('budget.title'),
            headerRight: () => (
                <View>
                    <TouchableOpacity
                        onPress={openMenu}
                        style={{ marginRight: 15 }}
                    >
                        <MaterialIcons name="more-vert" size={24} color={theme.text} />
                    </TouchableOpacity>
                    
                    <Modal
                        transparent={true}
                        visible={menuVisible}
                        onRequestClose={closeMenu}
                        animationType="fade"
                    >
                        <TouchableOpacity 
                            style={styles.modalOverlay} 
                            activeOpacity={1} 
                            onPress={closeMenu}
                        >
                            <View style={styles.menuContainer} onStartShouldSetResponder={() => true}>
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        router.push({pathname:"dashboard/editBudget", params:{ plan:JSON.stringify(budgetPlan) }});
                                    }}
                                >
                                    <MaterialIcons name="edit" size={20} color={theme.text} style={styles.menuIcon} />
                                    <Text style={[styles.menuText, { color: theme.text }]}>{t('budget.modify')}</Text>
                                </TouchableOpacity>
                                
                                <View style={styles.divider} />
                                
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        confirmDelete();
                                    }}
                                >
                                    <MaterialIcons name="delete" size={20} color={theme.coral} style={styles.menuIcon} />
                                    <Text style={[styles.menuText, { color: theme.coral }]}>{t('budget.delete.delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            )
        }} 
    />
        <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={[styles.container, { padding: 20 }]}>
                {!budgetPlan && <ActivityIndicator color={theme.primary} size="large" />}
                {budgetPlan && (
                    <View>
                        <View style={styles.centeredView}>
                            <View style={[styles.toolCard, {width:254, height:173, padding:20}]}>
                                <Image 
                                    source={require('../../../../assets/icons/budget.png')}
                                    style={{width:22, height:22, marginTop:10}}/>
                                <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize:14, color:theme.text, marginTop:10}}>
                                    {budgetPlan?.name}
                                </Text>
                                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize:12, color: theme.text, marginTop: 30 }}>
                                    {t(`budget.types.${budgetPlan?.period_type}`)}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {budgetPlan?.period_type !== 'year' && <Picker
                                    selectedValue={month}
                                    style={styles.picker}
                                    onValueChange={(value) => setMonth(value)}
                                    dropdownIconColor={theme.text}
                                >
                                    {months.map((m, index) => (
                                    <Picker.Item key={index} label={t(`common.months.${m}`)} value={index + 1} />
                                    ))}
                                </Picker>}

                                <Picker
                                    selectedValue={year}
                                    style={ styles.picker }
                                    onValueChange={(value) => setYear(value)}
                                    dropdownIconColor={theme.text}
                                >
                                    {years.map((y, index) => (
                                    <Picker.Item key={index} label={y.toString()} value={y} />
                                    ))}
                                </Picker>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent:'center' }}>
                                {budgetPlan?.period_type === 'week' && <Picker
                                    selectedValue={week}
                                    style={styles.picker}
                                    onValueChange={(value) => setWeek(value)}
                                    dropdownIconColor={theme.text}
                                >
                                    {weeks.map((m, index) => (
                                    <Picker.Item key={index} label={m.label} value={index + 1} />
                                    ))}
                                </Picker>}
                            </View>
                        </View>
                        <View style={styles.detailsContainer}>
                            <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                                <Image source={require('../../../../assets/icons/incomes.png')} style={{width:30, height:30}} />
                                <View style={styles.detailContainer}>
                                    <Text style={styles.label}>
                                        {t('common.terms.incomes')}
                                    </Text>
                                    <Text style={styles.incomes}>
                                    {formatCurrency(budgetPlan?.total_incomes)}
                                    </Text>
                                </View>

                            </View>
                            <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                                <Image source={require('../../../../assets/icons/expenses.png')} style={{width:30, height:30}} />
                                <View style={styles.detailContainer}>
                                    <Text style={styles.label}>
                                        {t('common.terms.spendings')}
                                    </Text>
                                    <Text style={styles.spendings}>
                                    {formatCurrency(budgetPlan?.groups?.reduce((a, b) => a + b.real_amount, 0))}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.centeredView}>
                        <View style={{ gap: 16, alignItems:'flex-start' }}>
                            {budgetPlan?.groups?.map((item) => {
                                const percent = Math.round(item.real_percentage * 100);
                                const limit = Math.round(item.limit_percentage * 100);
                                const progressColor =
                                    item.real_percentage > item.limit_percentage
                                        ? theme.coral
                                        : item.real_percentage > item.alert_threshold * item.limit_percentage
                                            ? theme.mustard
                                            : theme.mint;
                                return (
                                    <View 
                                        key={item.id.toString()}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent:'center'
                                        }}>
                                        <ProgressChart
                                            data={{ data: [Math.min(item.real_percentage / item.limit_percentage, 1)] }}
                                            width={80}
                                            height={64}
                                            radius={18}
                                            strokeWidth={7}
                                            hideLegend={true}
                                            chartConfig={{
                                                backgroundGradientFrom: theme.background,
                                                backgroundGradientTo: theme.background,
                                                color: (opacity = 1) => hexToRgba(progressColor, opacity),
                                                barPercentage: 1,
                                                useShadowColorFromDataset: false,
                                            }}
                                            style={{ marginRight: 1 }}
                                        />
                                        <View style={{}}>
                                            <Text style={styles.label}>
                                                {t(`budget.categories.${item.name}`)}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                                                <Text style={{
                                                    fontFamily: 'Montserrat-Medium',
                                                    fontSize: 14,
                                                    color: progressColor,
                                                }}>
                                                    {percent}%
                                                </Text>
                                                <Text style={{
                                                    fontFamily: 'Montserrat-Regular',
                                                    fontSize: 12,
                                                    color: theme.text,
                                                    marginLeft: 4,
                                                }}>
                                                    / {limit}%
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                                                <Text style={{
                                                    fontFamily: 'Montserrat-Medium',
                                                    fontSize: 14,
                                                    color: theme.text,
                                                }}>
                                                    {formatCurrency(item.real_amount)}
                                                </Text>
                                                <Text style={{
                                                    fontFamily: 'Montserrat-Regular',
                                                    fontSize: 12,
                                                    color: theme.text,
                                                }}>
                                                    / {formatCurrency(item.target_amount)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
        </>
    );
}