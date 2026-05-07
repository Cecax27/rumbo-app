import { Text, View,TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import { useTheme } from '../theme/useTheme';
import { TRANSACTION_CATEGORIES } from '../constants/appConstans';
import { useTranslation } from 'react-i18next';

export const SectionHeader = ({text, color}) =>{
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.headerText, {color:color}]}>{ text }</Text>
    </View>
  )
}

export const SectionItem = ({label, onPress, icon, color})=>{
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.sectionItem}>
        <MaterialIcons name={icon} size={32} color={color}/>
        <Text style={styles.textItem} numberOfLines={2} ellipsizeMode='tail'>
            { label }
            {"\n"}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export const SectionContainer = ({children, text, color})=>{
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <>
    <SectionHeader text={text} color={color}/>
    <View style={[styles.sectionContainer, {borderColor:color}]}> 
        <View style={styles.sectionGrid}>
            {React.Children.map(children, child =>
                React.cloneElement(child, { color })
            )}
        </View>
    </View>
    </>
  )
}

SectionContainer.item = SectionItem

export const Sections = ({onSelect})=>{
    const { theme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const { t } = useTranslation();

    const sectionColors = {
        discretionary: theme.coral,
        essentials: theme.mustard,
        savings: theme.mint
    }

    return(
        <ScrollView style={styles.list}>
        {
            TRANSACTION_CATEGORIES.map((budget_group) => (
                <SectionContainer key={budget_group.id} text={t(`budget.categories.${budget_group.budget_group}`)} color={sectionColors[budget_group.budget_group]}>
                    {
                        budget_group.categories.map((category) => (
                            <SectionContainer.item key={category.id} label={t(`transactions.categories.${category.name}`)} icon={category.icon} onPress={()=>onSelect(category.id)}/>
                        ))
                    }
                </SectionContainer>))
        }

        </ScrollView>
  )
}

const makeStyles = (theme) => {return StyleSheet.create({
  list: {
    backgroundColor: theme.background,
    flex:1,
    gap:10
  },
  sectionHeader:{
    backgroundColor: theme.background,
    paddingHorizontal:8,
    position:'abosulte',
    top:7,
    left:25,
    zIndex:1,
    alignSelf:'flex-start'
  },
  headerText:{
    fontSize:10,
    fontWeight:700
  },
  sectionContainer:{
    backgroundColor: theme.background,
    padding:10,
    alignItems:'center',
    flex:1,
    borderWidth:2,
    borderRadius:20,
  },
  sectionGrid:{
    flexDirection:'row',
    flexWrap: 'wrap',
    justifyContent:'flex-start',
    alignItems:'center',
    alignSelf:'center',
    width: 95*3
  },
  sectionItem:{
    width:95,
    height:80,
    backgroundColor:theme.background,
    alignItems:'center',
    justifyContent:'center',
    gap:5,
  },
  textItem:{
    fontSize:11,
    textAlign:'center',
    color:theme.subtext,
  }
})};
