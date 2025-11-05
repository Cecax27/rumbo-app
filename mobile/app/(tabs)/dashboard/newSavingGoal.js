import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';
import { makeStyles } from '../../../assets/uiStyles';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { createSavingGoal } from '../../../lib/supabase/savingGoals';
import { getAccounts } from '../../../lib/supabase/transactions';

export default function NewSavingGoal() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { t } = useTranslation();
  const router = useRouter();

  const RANGE_TYPES = useMemo(() => [
    { id: 'month', name: t('savingGoal.types.month') },
    { id: 'week', name: t('savingGoal.types.week') },
    { id: 'year', name: t('savingGoal.types.year') },
  ], [t]);

  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    account_id: null,
    goalAmount: '',
    rangeType: 'month',
    range: '24',
    annualInterestRate: '0.07',
    initialAmount: '0',
  });

  useEffect(() => {
    (async () => {
      const data = await getAccounts();
      setAccounts(data || []);
      if (data && data.length > 0) {
        setForm((prev) => ({ ...prev, account_id: prev.account_id ?? data[0].id }));
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('savingGoal.alerts.title'), t('savingGoal.alerts.missingName'));
      return;
    }
    if (!form.account_id) {
      Alert.alert(t('savingGoal.alerts.title'), t('savingGoal.alerts.missingAccount'));
      return;
    }

    const payload = {
      name: form.name.trim(),
      account_id: form.account_id,
      goalAmount: Number(form.goalAmount) || 0,
      rangeType: form.rangeType,
      range: Number(form.range) || 0,
      annualInterestRate: Number(form.annualInterestRate) || 0,
      initialAmount: Number(form.initialAmount) || 0,
    };

    if (payload.goalAmount <= 0 || payload.range <= 0) {
      Alert.alert(t('savingGoal.alerts.title'), t('savingGoal.alerts.invalidNumbers'));
      return;
    }

    try {
      const result = await createSavingGoal(payload);
      // Assume RPC returns id
      const createdId = typeof result === 'number' ? result : (result?.id ?? result);
      router.back();
      router.push(`/dashboard/savingGoalDetail/${createdId}`);
    } catch (e) {
      console.error(e);
      Alert.alert(t('savingGoal.alerts.title'), t('savingGoal.alerts.createError'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
      <Stack.Screen
        options={{
          title: t('savingGoal.titleNew'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit}>
              <Icon name="data-saver-on" size={24} color={theme.mint} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>{t('savingGoal.name')}</Text>
          <TextInput
            placeholder={t('savingGoal.namePlaceholder')}
            value={form.name}
            onChangeText={(text) => setForm((p) => ({ ...p, name: text }))}
            style={styles.textInput}
            placeholderTextColor={theme.subtext}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('savingGoal.account')}</Text>
          <View style={{ width: '100%' }}>
            <Picker
              selectedValue={form.account_id}
              onValueChange={(v) => setForm((p) => ({ ...p, account_id: v }))}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              {accounts.map((a) => (
                <Picker.Item key={a.id} label={`${a.name}`} value={a.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('savingGoal.goalAmount')}</Text>
          <TextInput
            placeholder="100000"
            value={form.goalAmount}
            onChangeText={(text) => setForm((p) => ({ ...p, goalAmount: text.replace(/[^0-9.]/g, '') }))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor={theme.subtext}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('savingGoal.rangeType')}</Text>
          <View style={{ width: '100%' }}>
            <Picker
              selectedValue={form.rangeType}
              onValueChange={(v) => setForm((p) => ({ ...p, rangeType: v }))}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              {RANGE_TYPES.map((rt) => (
                <Picker.Item key={rt.id} label={rt.name} value={rt.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('savingGoal.range')}</Text>
          <TextInput
            placeholder="24"
            value={form.range}
            onChangeText={(text) => setForm((p) => ({ ...p, range: text.replace(/[^0-9]/g, '') }))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor={theme.subtext}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('savingGoal.annualInterestRate')}</Text>
          <TextInput
            placeholder="0.07"
            value={form.annualInterestRate}
            onChangeText={(text) => setForm((p) => ({ ...p, annualInterestRate: text.replace(/[^0-9.]/g, '') }))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor={theme.subtext}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('savingGoal.initialAmount')}</Text>
          <TextInput
            placeholder="0"
            value={form.initialAmount}
            onChangeText={(text) => setForm((p) => ({ ...p, initialAmount: text.replace(/[^0-9.]/g, '') }))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor={theme.subtext}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

NewSavingGoal.options = { headerShown: true };
