import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '../../../assets/uiStyles';
import { Picker } from '@react-native-picker/picker';
import { Slider } from '@react-native-assets/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addBudget } from '../../../lib/supabase/tools';

export default function NewBudget() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();

  const BUDGET_TYPES = useMemo(() => [
    { id: 'month', name: t('budget.types.month') },
    { id: 'week', name: t('budget.types.week') },
    { id: 'year', name: t('budget.types.year') },
  ], [t]);

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'month',
    customDays: 30,
    categories: {
      essentials: { limit_percentage: 50, alert_threshold: 80 },
      discretionary: { limit_percentage: 30, alert_threshold: 80 },
      savings: { limit_percentage: 20, alert_threshold: 80 },
    },
  });

  const handleSubmit = async () => {
    if (formData.categories.essentials.limit_percentage + 
        formData.categories.discretionary.limit_percentage + 
        formData.categories.savings.limit_percentage > 100) {
      Alert.alert(
        t('budget.alerts.overallocation.title'), 
        t('budget.alerts.overallocation.message'),
        [{ text: t('budget.alerts.button') }]
      );
      return;
    } else if (formData.type === 'custom' && formData.customDays <= 0) {
      Alert.alert(
        t('budget.alerts.invalidPeriod.title'), 
        t('budget.alerts.invalidPeriod.message'),
        [{ text: t('budget.alerts.button') }]
      );
      return;
    } else if (formData.name.trim() === '') {
      Alert.alert(
        t('budget.alerts.missingName.title'), 
        t('budget.alerts.missingName.message'),
        [{ text: t('budget.alerts.button') }]
      );
      return;
    } else {
      try {
        const result = await addBudget({
          name: formData.name,
          period_type: formData.type,
          period_length_days: formData.type === 'custom' ? formData.customDays : null,
          plan_groups: formData.categories
        })     
        router.back();
        router.push(`dashboard/budgetDetails/${result}`);
      } catch (error) {
        console.error('Error creating budget:', error);
        Alert.alert(
          t('budget.alerts.error.title'), 
          t('budget.alerts.error.createMessage')
        );
      }
    }
  };

  const updateCategoryPercentage = (category, value) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          limit_percentage: value,
        },
      },
    }));
  };

  const updatealert_threshold = (category, value) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          alert_threshold: value,
        },
      },
    }));
  };

  const renderPercentageSlider = (category, label, max = 100) => (
    <View style={styles.filterSection}>
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
        <Text style={styles.filterLabel}>
          {t(`budget.categories.${category}`)}
        </Text>
        <Text style={[styles.spendings, {fontSize:14}]}>
          {formData.categories[category].limit_percentage}%
        </Text>
      </View>
      <Slider
        value={formData.categories[category].limit_percentage}
        onValueChange={(value) => updateCategoryPercentage(category, value)}
        minimumValue={0}
        maximumValue={max}
        step={1}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.surface}
        thumbTintColor={theme.primary}
        trackHeight={8}
        thumbSize={20}
        onSlidingStart={() => setScrollEnabled(false)}
        onSlidingComplete={() => setScrollEnabled(true)}
      />
      
      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[styles.filterLabel, { marginBottom: 5 }]}>{t('budget.categories.alertThreshold')}</Text>
          <Text style={{ color: theme.subtext, fontSize: 12 }}>{formData.categories[category].alert_threshold}%</Text>
        </View>
        <Slider
          value={formData.categories[category].alert_threshold}
          onValueChange={(value) => updatealert_threshold(category, value)}
          minimumValue={50}
          maximumValue={100}
          step={5}
          minimumTrackTintColor={theme.secondary}
          maximumTrackTintColor={theme.surface}
          thumbTintColor={theme.secondary}
          onSlidingStart={() => setScrollEnabled(false)}
          onSlidingComplete={() => setScrollEnabled(true)}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: t('budget.title'),
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

      <ScrollView 
        style={styles.modalContent}
        keyboardShouldPersistTaps='handled'
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>{t('budget.name')}</Text>
          <TextInput
            placeholder={t('budget.namePlaceholder')}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            style={styles.textInput}
            placeholderTextColor={theme.subtext}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('budget.type')}</Text>
          <View style={{ width: '100%' }}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(itemValue) => setFormData(prev => ({ ...prev, type: itemValue }))}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              {BUDGET_TYPES.map((type) => (
                <Picker.Item 
                  key={type.id} 
                  label={type.name} 
                  value={type.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {formData.type === 'custom' && (
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>{t('budget.customDays')}</Text>
            <TextInput
              placeholder='30'
              value={formData.customDays.toString()}
              onChangeText={(text) => {
                const days = parseInt(text) || 1;
                setFormData(prev => ({ ...prev, customDays: Math.max(1, days) }));
              }}
              keyboardType='numeric'
              style={styles.textInput}
            />
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>{t('budget.allocation')}</Text>
          
          <View style={{ marginBottom: 20, padding: 15, backgroundColor: theme.surface, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ color: theme.text }}>{t('budget.totalAllocated')}</Text>
              <Text style={{ 
                color: (formData.categories.essentials.limit_percentage + 
                  formData.categories.discretionary.limit_percentage + 
                  formData.categories.savings.limit_percentage)<=100?theme.text:theme.coral, fontWeight: '600' }}>
                {formData.categories.essentials.limit_percentage + 
                 formData.categories.discretionary.limit_percentage + 
                 formData.categories.savings.limit_percentage}%
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.subtext, fontSize: 12 }}>{t('budget.remaining')}</Text>
              <Text style={{ color: theme.subtext, fontSize: 12 }}>
                {100 - (formData.categories.essentials.limit_percentage + 
                       formData.categories.discretionary.limit_percentage + 
                       formData.categories.savings.limit_percentage)}% {t('budget.available')}
              </Text>
            </View>
          </View>

          {renderPercentageSlider('essentials', 'Essentials')}
          {renderPercentageSlider('discretionary', 'Discretionary')}
          {renderPercentageSlider('savings', 'Savings')}
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

NewBudget.options = {
  headerShown: true,
};