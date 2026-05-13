import { View, Pressable, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useEffect, useState } from 'react';
import { getAccounts, getCategories, getBudgetGroups } from '../lib/supabase/transactions';
import { useThemeColors } from '../theme/useThemeColors';

import { Picker } from '@react-native-picker/picker';

export default function FilterModal ({visible, onClose, filter, setFilter}) {
  const { colors } = useThemeColors();

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

    const inputStyle = { borderColor: colors.border, borderWidth: 1, borderRadius: 100, padding: 10, marginBottom: 10, fontFamily: 'Montserrat-Medium', color: colors.text };
    const labelStyle = { fontSize: 12, fontFamily: 'Montserrat-Regular', marginBottom: 8, color: colors.subtext };
    const pickerStyle = { borderRadius: 100, fontSize: 14, fontFamily: 'Montserrat-Medium', color: colors.text, flex: 1, borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 10 };

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', marginTop:22 }}>
          <View style={{ margin:10, backgroundColor:colors.background, borderRadius:30, padding:35, shadowColor:'#000', shadowOpacity:1, shadowRadius:1, elevation:5, width:'90%' }}>
            <View style={{ width:'100%', flexDirection:'row', justifyContent:'space-between', marginBottom:20 }}>
              <Text style={{ fontSize:20, fontFamily:'Quicksand-Bold', color:colors.text }}>Filter Transactions</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color:colors.primary, fontFamily:'Quicksand-Bold' }}>x</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ width:'100%' }}>
              <View style={{ marginBottom:20, width:'100%' }}>
                <Text style={labelStyle}>Date Range</Text>
                <View style={{ flexDirection:'row', justifyContent:'space-between', width:'100%' }}>
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
                      placeholderTextColor={colors.border}
                      style={inputStyle}
                      editable={false}
                    />  
                  </Pressable>
                  <Text style={{ color: colors.text }}>-</Text>
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
                      placeholderTextColor={colors.border}
                      style={inputStyle}
                      editable={false}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={{ marginBottom:20, width:'100%' }}>
                <Text style={labelStyle}>Account</Text>
                <Picker
                  selectedValue={filter.account}
                  onValueChange={(itemValue) => setFilter(prev => ({ ...prev, account: itemValue }))}
                  style={pickerStyle}
                >
                  <Picker.Item label="All Accounts" value={null} />
                  {accounts.map((account) => (
                    <Picker.Item key={account.id} label={account.name} value={account.id} />
                  ))}
                </Picker>
              </View>

              <View style={{ marginBottom:20, width:'100%' }}>
                <Text style={labelStyle}>Category</Text>
                <Picker
                  selectedValue={filter.category}
                  onValueChange={(itemValue) => setFilter(prev => ({ ...prev, category: itemValue }))}
                  style={pickerStyle}
                >
                  <Picker.Item label="All Categories" value={null} />
                  {categories.map((item) => (
                    <Picker.Item key={item.id} label={item.name.replace('_', ' ').replace(/\w/, c => c.toUpperCase())} value={item.id} />
                  ))}
                </Picker>
              </View>

              <View style={{ marginBottom:20, width:'100%' }}>
                <Text style={labelStyle}>Budget Group</Text>
                <Picker
                  selectedValue={filter.budget_group}
                  onValueChange={(itemValue) => setFilter(prev => ({ ...prev, budget_group: itemValue }))}
                  style={pickerStyle}
                >
                  <Picker.Item label="All Budget Groups" value={null} />
                  {budgetGroups.map((item) => (
                    <Picker.Item key={item.id} label={item.name.replace('_', ' ').replace(/\w/, c => c.toUpperCase())} value={item.id} />
                  ))}
                </Picker>
              </View>
            </ScrollView>

            <View style={{ marginTop:20, width:'100%' }}>
              <TouchableOpacity
                style={{ backgroundColor:colors.primary, padding:13, paddingHorizontal:20, borderRadius:50, alignItems:'center', justifyContent:'center' }}
                onPress={onClose}
              >
                <Text style={{ color:'#1A1A1A', fontFamily:'Quicksand-Bold' }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }