import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '../../../assets/uiStyles';
import { Picker } from '@react-native-picker/picker';
import { Slider } from '@react-native-assets/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateBudget } from '../../../lib/supabase/tools';

export default function EditBudget() {
  const { plan } = useLocalSearchParams();
  const parsedPlan = plan ? JSON.parse(plan) : null;
  
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();

  const BUDGET_TYPES = useMemo(() => [
    { id: 'month', name: t('budget.types.month') },
    { id: 'week', name: t('budget.types.week') },
    { id: 'year', name: t('budget.types.year') },
  ], [t]);

  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
        if (parsedPlan) {
            const formattedPlan = {
                name: parsedPlan.name,
                type: parsedPlan.period_type,
                customDays: parsedPlan.period_length_days || 30,
                categories:{}
            }
            parsedPlan.groups.map((item)=>{
                formattedPlan.categories[item.name]={
                    limit_percentage:item.limit_percentage*100,
                    alert_threshold:item.alert_threshold*100
                }
            })            
          setFormData(formattedPlan);
        }
        setIsLoading(false);

  }, []);

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
    }

    try {
      await updateBudget({
        id: parsedPlan.id,
        name: formData.name,
        period_type: formData.type,
        period_length_days: formData.type === 'custom' ? formData.customDays : null,
        plan_groups: formData.categories
      });
      
      Alert.alert(
        t('budget.alerts.success.title'), 
        t('budget.alerts.success.message')
      );
      router.back();
    } catch (error) {
      console.error('Error updating budget:', error);
      Alert.alert(
        t('budget.alerts.error.title'), 
        t('budget.alerts.error.message')
      );
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

  const updateAlertThreshold = (category, value) => {
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
          {label}
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
          onValueChange={(value) => updateAlertThreshold(category, value)}
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

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>{t('budget.loading')}</Text>
      </View>
    );
  }

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
              <Icon name="save" size={24} color={theme.mint} />
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
          <Text style={styles.filterLabel}>{t('budget.name')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('budget.namePlaceholder')}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholderTextColor={theme.subtext}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>{t('budget.type')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(itemValue) => setFormData(prev => ({ ...prev, type: itemValue }))}
              style={{ color: theme.text }}
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
          <>
            <Text style={styles.sectionTitle}>{t('budget.customDays')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.customDays.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, customDays: num }));
              }}
              placeholderTextColor={theme.subtext}
            />
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>{t('budget.allocation')}</Text>
          
          <View style={{ marginBottom: 20, padding: 15, backgroundColor: theme.surface, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ color: theme.text }}>{t('budget.totalAllocated')}</Text>
              <Text style={{ 
                color: (formData.categories.essentials.limit_percentage + 
                  formData.categories.discretionary.limit_percentage + 
                  formData.categories.savings.limit_percentage) <= 100 ? theme.text : theme.coral, 
                fontWeight: '600' 
              }}>
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

          {renderPercentageSlider('essentials', t('budget.categories.essentials'))}
          {renderPercentageSlider('discretionary', t('budget.categories.discretionary'))}
          {renderPercentageSlider('savings', t('budget.categories.savings'))}
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

EditBudget.options = {
  headerShown: true,
};
