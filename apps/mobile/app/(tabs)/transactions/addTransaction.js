import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Alert, ScrollView, TextInput, Text, TouchableOpacity, Platform, Switch, KeyboardAvoidingView } from 'react-native'
import { makeStyles } from '../../../assets/uiStyles'
import { getAccounts, getCategories, addTransaction, addIncome, addTransfer, addDeferred } from '../../../lib/supabase/transactions';
import { Picker } from '@react-native-picker/picker'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../../theme/useTheme';
import Snackbar from '../../../components/Snackbar';
import { useTranslation } from 'react-i18next';
import FButton from '../../../components/fbutton'
import { Sections } from '../../../components/categoriesMenu';
import Input from '../../../components/input';
import InputPicker from '../../../components/inputPicker';
import InputDate from '../../../components/inputDate';

export default function AddTransaction() {
    const router = useRouter()
    const { t } = useTranslation();
    const { type:typeParam } = useLocalSearchParams()
    
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const [type, setType] = useState(typeParam || 'spending')
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])
    const [selectCategoryScreen,setSelectCategoryScreen ] = useState(false)
    const [formData, setFormData] = useState({
        date: new Date(),
        description: '',
        amount: '',
        account_id: null,
        category_id: null,
        to_account_id: null,
        months: null
    })

    useEffect(() => {
        fetchOptions()
    }, [])

    const fetchOptions = async () => {
       getAccounts().then((accounts) => {
            if (accounts.length === 0) {
                Alert.alert(t('common.error'), t('transactions.error.noAccounts'))
                router.replace('/(tabs)/accounts/newaccount')
            }
            setAccounts(accounts)
        })
        getCategories().then((categories) => {
            setCategories(categories)
        })
    }

    const handleSubmit = async () => {
        try {
            const { date, amount, description, account_id, category_id, months } = formData
            const formattedDate = date.toISOString().slice(0, 10)
            const parsedAmount = parseFloat(amount)
            let result = {}

            if (!account_id){
                Alert.alert(t('common.error'), t('transactions.error.noAccountSelected'))
                return
            }

            if (type === 'spending') {
                result = await addTransaction({date: formattedDate, amount: parsedAmount, description, category_id, account_id})
            } else if (type === 'deferred') {
                result = await addDeferred({date: formattedDate, amount: parsedAmount, description, category_id, account_id, months})
            } else if (type === 'income') {
                result = await addIncome({date: formattedDate, amount: parsedAmount, description, account_id})
            } else if (type === 'transfer') {
                const { to_account_id, account_id} = formData
                result = await addTransfer({date: formattedDate, amount: parsedAmount, description, from_account_id: account_id, to_account_id})
            }
            if (result !== true) {
                Alert.alert(t('transactions.error.title'), t('transactions.error.message') + (result?.message ? ` (${result.message})` : ''))
            }
            global.showSnackbar(t('transactions.success'))
            onClose()
        } catch (error) {
            Alert.alert(t('transactions.error.title'), t('transactions.error.addFailed'))
            console.error('Error adding transaction:', error)
        }
    }

    const onClose = () => {
        router.replace('/(tabs)/transactions')
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100}
        >
            <Stack.Screen
                options={{
                title: t("newAccount.title"),
                headerLeft: () => (
                    <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginRight: 15 }}
                    >
                    <Icon name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                ),
                }}
            />
            {selectCategoryScreen && <Sections onSelect={(category) => {setFormData(prev => ({ ...prev, category_id: category })); setSelectCategoryScreen(false)}}/>}
            {!selectCategoryScreen && <>

            <ScrollView style={styles.modalContent}>
                <View style={[styles.filterSection, transactionStyles.typeButtons]}>
                    <FButton text={t('transactions.types.spending')} onPress={() => setType('spending')} active={(type==='spending' || type==='deferred') ? true : false}/>
                    <FButton text={t('transactions.types.income')} onPress={() => setType('income')} active={type==='income' ? true : false}/>
                    <FButton text={t('transactions.types.transfer')} onPress={() => setType('transfer')} active={type==='transfer' ? true : false}/>
                </View>

                <Input
                    label={t("transactions.amount")}
                    value={formData.amount}
                    onChange={(text) => setFormData((prev) => ({ ...prev, amount: text }))}
                    placeholder={t("transactions.amountPlaceholder")}
                    icon="attach-money"
                    numeric
                />

                {(type==='spending' || type==='deferred') && <TouchableOpacity onPress={()=>{setSelectCategoryScreen(true)}}>
                    <Input
                        label={t("transactions.category")}
                        value={formData.category_id ? t(`transactions.categories.${categories.find((category) => category.id === formData.category_id).name}`) : t('transactions.selectCategory')}
                        onChange={(text) => {}}
                        placeholder={t("transactions.amountPlaceholder")}
                        icon={categories.find((category) => category.id === formData.category_id)?.icon??'help'}
                        editable={false}
                        clear={false}
                    />
                </TouchableOpacity>}

                <InputDate
                    label={t("transactions.date")}
                    value={formData.date}
                    onChange={(date) => setFormData(prev => ({ ...prev, date: date }))}
                    placeholder={t("transactions.amountPlaceholder")}
                    icon="calendar-today"
                    numeric
                />

                <Input
                    label={t("transactions.description")}
                    value={formData.description}
                    onChange={(text) =>
                        setFormData((prev) => ({ ...prev, description: text }))
                    }
                    placeholder={t("transactions.descriptionPlaceholder")}
                    icon="text-format"
                    optional
                />

                <InputPicker
                    label={type==='transfer' ? t('transactions.fromAccount') : t('transactions.account')}
                    value={formData.account_id}
                    onChange={(text) =>
                    setFormData((prev) => ({ ...prev, account_id: text }))
                    }
                    options={accounts}
                    optionlabel='name'
                    icon="credit-card"
                    prompt={t("newAccount.selectAccountType")}
                    
                />

                {type==='transfer' && <InputPicker
                    label={t('transactions.toAccount')}
                    value={formData.to_account_id}
                    onChange={(text) =>
                    setFormData((prev) => ({ ...prev, to_account_id: text }))
                    }
                    options={accounts}
                    optionlabel='name'
                    icon="credit-card"
                    prompt={t("newAccount.selectAccountType")}
                />}

                {(type==='spending' || type==='deferred') && <View style={[styles.filterSection, { flexDirection:'row', justifyContent:'space-between', alignItems:'center' }]}>
                    <Text style={styles.filterLabel}>{t('transactions.deferredSpending')}</Text>
                    <Switch 
                        value={type==='deferred'}
                        onValueChange={(value) => setType(value ? 'deferred' : 'spending')}
                        trackColor={{ false: theme.surface, true: theme.subtext }}
                        thumbColor={theme.primary}
                    />
                </View>}

                {type==='deferred' && <Input
                    label={t("transactions.months")}
                    value={formData.months}
                    onChange={(text) =>
                        setFormData((prev) => ({ ...prev, months: text }))
                    }
                    placeholder="12"
                    icon="calendar-today"
                    numeric
                />}
            
                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.textStyle}>{t('transactions.add')} {t(`transactions.types.${type}`)}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            
            </>}
            <Snackbar />
        </KeyboardAvoidingView>
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