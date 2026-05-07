import { View, Pressable, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { makeStyles } from '../assets/uiStyles'
import { useEffect, useMemo, useState } from 'react';
import { getAccounts, getCategories, getBudgetGroups } from '../lib/supabase/transactions';
import { useTheme } from '../theme/useTheme';

import { Picker } from '@react-native-picker/picker';

export default function FilterModal ({visible, onClose, filter, setFilter}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])
    const [budgetGroups, setBudgetGroups] = useState([])
    const [startDateVisible, setStartDateVisible] = useState(false);
    const [endDateVisible, setEndDateVisible] = useState(false);

    useEffect(() => {
      getAccounts().then((accounts) => {
        setAccounts(accounts)
      })
      getCategories().then((categories) => {
        setCategories(categories)
      })
      getBudgetGroups().then((budgetGroups) => {
        setBudgetGroups(budgetGroups)
      })
    }, []);

    useEffect(() => { 
        setSelectedStartDate(new Date(filter.start_date));
        setSelectedEndDate(new Date(filter.end_date));
     }, [filter])

    const handleStartDateConfirm = ({ type }, date) => {
          if (type === 'set') {
            setSelectedStartDate(date);
            setFilter(prev => ({ ...prev, start_date: date }));
            setStartDateVisible(false);
          } else {
            toggleStartDatepicker()
          }
        };
    
        const handleEndDateConfirm = ({ type }, date) => {
          if (type === 'set'){
            setSelectedEndDate(date);
            setFilter(prev => ({ ...prev, end_date: date }));
            setEndDateVisible(false);
          } else {
            toggleEndDatepicker()
          }
        };

        const toggleStartDatepicker = () => {
          setStartDateVisible(!startDateVisible);
        }
    
        const toggleEndDatepicker = () => {
          setEndDateVisible(!endDateVisible)
        }

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>x</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Date Range</Text>
                <View style={styles.dateInputs}>
                  {startDateVisible && (
                    <DateTimePicker 
                      mode='date'
                      display='spinner'
                      value={selectedStartDate}
                      onChange={handleStartDateConfirm}
                    />
                  )}
                  <Pressable onPress={toggleStartDatepicker}>
                    <TextInput 
                      placeholder='Start date'
                      value={selectedStartDate.toLocaleDateString()}
                      onChangeText={(text) => setSelectedStartDate(new Date(text))}
                      placeholderTextColor="#11182744"
                      style={styles.dateInput}
                      editable={false}
                    />  
                  </Pressable>
                  <Text>-</Text>
                  {endDateVisible && (
                    <DateTimePicker 
                      mode='date'
                      display='spinner'
                      value={selectedEndDate}
                      onChange={handleEndDateConfirm}
                    />
                  )}
                  <Pressable onPress={toggleEndDatepicker}>
                    <TextInput 
                      placeholder='End date'
                      value={selectedEndDate.toLocaleDateString()}
                      onChangeText={(text) => setSelectedEndDate(new Date(text))}
                      placeholderTextColor="#11182744"
                      style={styles.dateInput}
                      editable={false}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Account</Text>
                <Picker
                  selectedValue={filter.account}
                  onValueChange={(itemValue) => setFilter(prev => ({ ...prev, account: itemValue }))}
                  style={styles.picker}
                >
                  <Picker.Item label="All Accounts" value={null} />
                  {accounts.map((account) => (
                    <Picker.Item key={account.id} label={account.name} value={account.id} />
                  ))}
                </Picker>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                <Picker
                  selectedValue={filter.category}
                  onValueChange={(itemValue) => setFilter(prev => ({ ...prev, category: itemValue }))}
                  style={styles.picker}
                >
                  <Picker.Item label="All Categories" value={null} />
                  {categories.map((item) => (
                    <Picker.Item key={item.id} label={item.name.replace('_', ' ').replace(/\w/, c => c.toUpperCase())} value={item.id} />
                  ))}
                </Picker>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Budget Group</Text>
                <Picker
                  selectedValue={filter.budget_group}
                  onValueChange={(itemValue) => setFilter(prev => ({ ...prev, budget_group: itemValue }))}
                  style={styles.picker}
                >
                  <Picker.Item label="All Budget Groups" value={null} />
                  {budgetGroups.map((item) => (
                    <Picker.Item key={item.id} label={item.name.replace('_', ' ').replace(/\w/, c => c.toUpperCase())} value={item.id} />
                  ))}
                </Picker>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={onClose}
              >
                <Text style={styles.textStyle}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }