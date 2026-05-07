import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Stack, useRouter, useGlobalSearchParams } from 'expo-router';
import { useTheme } from '../../../../theme/useTheme';
import { makeStyles } from '../../../../assets/uiStyles';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getSavingGoal } from '../../../../lib/supabase/savingGoals';

export default function SavingGoalDetail() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { t } = useTranslation();
  const router = useRouter();
  const params = useGlobalSearchParams();

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavingGoal(params.id);
      setGoal(data);
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error'), t('savingGoal.alerts.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [params.id, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onEdit = () => {
    router.push({ pathname: 'dashboard/editSavingGoal', params: { id: params.id, goal: JSON.stringify(goal) } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('savingGoal.titleDetail'),
          headerRight: () => (
            <TouchableOpacity onPress={onEdit} style={{ marginRight: 15 }}>
              <Icon name="edit" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={[styles.container, { padding: 20, gap: 16 }]}>          
          {loading && <ActivityIndicator color={theme.primary} size="large" />}
          {!loading && goal && (
            <>
              <View style={[styles.toolCard, { padding: 20, alignItems: 'flex-start' }]}>                
                <Image source={require('../../../../assets/icons/budget.png')} style={{ width: 22, height: 22, marginTop: 10 }} />
                <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: theme.text, marginTop: 10 }}>
                  {goal?.name ?? t('savingGoal.titleDetail')}
                </Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 12, color: theme.text, marginTop: 6 }}>
                  {t(`savingGoal.types.${goal?.params?.rangeType || 'month'}`)}
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                <View style={styles.detailsContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t('savingGoal.contribution')}</Text>
                    <Text style={styles.incomes}>{Number(goal?.contribution).toLocaleString()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t('savingGoal.totalContributed')}</Text>
                    <Text style={styles.spendings}>{Number(goal?.totalContributed).toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t('savingGoal.totalInterest')}</Text>
                    <Text style={styles.incomes}>{Number(goal?.totalInterest).toLocaleString()}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.toolCard, { padding: 16, gap: 6 }]}>                
                <Text style={{ fontFamily: 'Montserrat-SemiBold', color: theme.text, marginBottom: 6 }}>{t('savingGoal.parameters')}</Text>
                <Text style={{ color: theme.text }}>{t('savingGoal.goalAmount')}: {goal?.params?.goalAmount}</Text>
                <Text style={{ color: theme.text }}>{t('savingGoal.rangeType')}: {t(`savingGoal.types.${goal?.params?.rangeType}`)}</Text>
                <Text style={{ color: theme.text }}>{t('savingGoal.range')}: {goal?.params?.range}</Text>
                <Text style={{ color: theme.text }}>{t('savingGoal.annualInterestRate')}: {goal?.params?.annualInterestRate}</Text>
                <Text style={{ color: theme.text }}>{t('savingGoal.initialAmount')}: {goal?.params?.initialAmount}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

SavingGoalDetail.options = { headerShown: true };
