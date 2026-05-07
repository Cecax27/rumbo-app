import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, Alert, ScrollView, TextInput, Text, TouchableOpacity, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { makeStyles } from '../../../../assets/uiStyles'
import { getAccounts, getCategories, updateTransaction } from '../../../../lib/supabase/transactions';
import { Picker } from '@react-native-picker/picker'
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../../../theme/useTheme';
import { useTranslation } from 'react-i18next';

export default function EditTransaction() {
    const { theme } = useTheme()
    const { t } = useTranslation()
    const styles = useMemo(() => makeStyles(theme), [theme])

    const router = useRouter()
    
    const params = useLocalSearchParams()
 
    const id = parseInt(params.deferred_id) || parseInt(params.id)
    const type = params.type
    const [day, month, year] = params.date.split('/')

    const [dateVisible, setDateVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date(year, month - 1, day))
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        ... params,
        date: new Date(year, month - 1, day),
        account_id: params.account_id ? parseInt(params.account_id) : parseInt(params.from_account_id),
        category_id: params.category_id ? parseInt(params.category_id) : null,
        to_account_id: params.to_account_id ? parseInt(params.to_account_id) : null,
    })

    useEffect(() => {
        fetchOptions()
    }, [])

    const fetchOptions = async () => {
       getAccounts().then((accounts) => {
            setAccounts(accounts)
        })
        getCategories().then((categories) => {
            setCategories(categories)
        })
    }

    const handleDateConfirm = ({ type }, date) => {
        if (type === 'set') {
            setSelectedDate(date)
            setFormData(prev => ({ ...prev, date: date }))
            setDateVisible(false)
        } else {
            toggleDatepicker()
        }
    }

    const toggleDatepicker = () => {
        setDateVisible(!dateVisible)
    }

    const handleSubmit = async () => {
        try {
            const { date, amount, description, account_id, category_id, to_account_id, months } = formData
            const formattedDate = date.toISOString().slice(0, 10)
            const parsedAmount = parseFloat(amount)

            const params = {
                id,
                description,
                ... (type!=='deferred'? {date: formattedDate}:{start_date: formattedDate}),
                ... (type!=='deferred'? {amount: parsedAmount}:{total_amount: parsedAmount}),
                ... (type !== 'transfer' ? { account_id } : {}),
                ... ((type === 'spending'||type === 'deferred') ? { category_id } : {}),
                ... ((type === 'deferred') ? { months } : {}),
                ... (type === 'transfer' ? { from_account_id: account_id } : {}),
                ... (type === 'transfer' ? { to_account_id } : {})
            }

            const result = await updateTransaction(id, type, params)
            if (result === true) {
                Alert.alert(t('common.success'), t('transactions.updateSuccess'))
            } else {
                Alert.alert(t('common.error'), t('transactions.updateError') + (result?.message || ''))
            }
            onClose()
        } catch (error) {
            Alert.alert(t('common.error'), t('transactions.addError'))
            console.error('Error adding transaction:', error)
        }
    }

    const onClose = () => {
        router.replace('/(tabs)/transactions')
    }

    return (
        <View style={styles.container}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('common.edit')} {t(`transactions.types.${type}`)}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Icon name="arrow-back" size={20} color="#c2bb00" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>

                <View style={[styles.filterSection, { marginBottom: 16 }]}>
                    <Text style={[styles.filterLabel, { marginBottom: 8 }]}>{t('transactions.date')}</Text>
                    <View style={{ position: 'relative' }}>
                        {dateVisible && (
                            <DateTimePicker 
                                mode='date'
                                display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                                value={selectedDate}
                                onChange={handleDateConfirm}
                                style={{ width: '100%' }}
                            />
                        )}
                        <Pressable 
                            onPress={toggleDatepicker}
                            style={[styles.dateInputContainer]}
                        >
                            <TextInput 
                                placeholder={t('transactions.selectDate')}
                                value={selectedDate.toLocaleDateString()}
                                placeholderTextColor={theme.text}
                                style={[styles.dateInput, { color: theme.text }]}
                                editable={false}
                            />  
                        </Pressable>
                    </View>
                </View>

                <View style={[styles.filterSection, { marginBottom: 16 }]}>
                    <Text style={[styles.filterLabel, { marginBottom: 8 }]}>{t('transactions.description')}</Text>
                    <TextInput
                        placeholder={t('transactions.descriptionPlaceholder')}
                        value={formData.description}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        style={[styles.textInput]}
                    />
                </View>

                <View style={[styles.filterSection, { marginBottom: 16 }]}>
                    <Text style={[styles.filterLabel, { marginBottom: 8 }]}>{t('transactions.amount')}</Text>
                    <TextInput
                        placeholder={t('transactions.amountPlaceholder')}
                        value={formData.amount}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                        keyboardType='numeric'
                        style={[styles.textInput]}
                    />
                </View>

                <View style={[styles.filterSection, { marginBottom: 16 }]}>
                    <Text style={[styles.filterLabel, { marginBottom: 8 }]}>{type==='transfer' ? t('transactions.fromAccount') : t('transactions.account')}</Text>
                    <View style={{ width: '100%' }}>
                        <Picker
                            selectedValue={formData.account_id}
                            onValueChange={(itemValue) => setFormData(prev => ({ ...prev, account_id: itemValue }))}
                            style={styles.picker}
                        >
                            <Picker.Item label={t('transactions.selectAccount')} value={null} />
                            {accounts.map((account) => (
                                <Picker.Item key={account.id} label={account.name} value={account.id} />
                            ))}
                        </Picker>
                    </View>
                </View>
                {type==='transfer' && <View style={[styles.filterSection, { marginBottom: 16 }]}>
                    <Text style={[styles.filterLabel, { marginBottom: 8 }]}>{t('transactions.toAccount')}</Text>
                    <View style={{ width: '100%' }}>
                        <Picker
                            selectedValue={formData.to_account_id}
                            onValueChange={(itemValue) => setFormData(prev => ({ ...prev, to_account_id: itemValue }))}
                            style={styles.picker}
                        >
                            <Picker.Item label={t('transactions.selectAccount')} value={null} />
                            {accounts.map((account) => (
                                <Picker.Item key={account.id} label={account.name} value={account.id} />
                            ))}
                        </Picker>
                    </View>
                </View>}

                {(type==='spending' || type==='deferred') && <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>{t('transactions.category')}</Text>
                    <View style={{ width: '100%' }}>
                        <Picker
                            selectedValue={formData.category_id}
                            onValueChange={(itemValue) => setFormData(prev => ({ ...prev, category_id: itemValue }))}
                            style={styles.picker}
                        >
                            <Picker.Item label={t('transactions.selectCategory')} value={null} />
                            {categories.map((category) => (
                                <Picker.Item key={category.id} label={t(`transactions.categories.${category.name}`)} value={category.id} />
                            ))}
                        </Picker>
                    </View>
                </View>}

                {type==='deferred' && <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Months</Text>
                        <TextInput
                        placeholder='12'
                        value={formData.months}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, months: text }))}
                        keyboardType='numeric'
                        style={[styles.textInput]}
                    />
                </View>}
            </ScrollView>
            
            <View style={styles.modalFooter}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonClose]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.textStyle}>Update {type}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export const transactionStyles = StyleSheet.create({
    typeButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16
    },
    typeButton: {
        flexGrow: 1,
        padding: 10,
        borderRadius: 25,
        backgroundColor: '#053547',
        alignItems: 'center',
        justifyContent: 'center',
    }
})