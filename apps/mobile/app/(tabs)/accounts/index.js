import { View, Text, Alert, FlatList, StyleSheet, Dimensions, RefreshControl, ActivityIndicator } from 'react-native'
import { makeStyles } from '../../../assets/uiStyles'
import { useState, useEffect, useMemo } from 'react'
import { getAccounts, getCreditCardSpendings, deleteAccount } from '../../../lib/supabase/transactions'
import { useRouter, Link } from 'expo-router'
import { useTheme } from '../../../theme/useTheme'
import { useTranslation } from 'react-i18next'
import { ACCOUNT_TYPES } from '../../../constants/appConstans'
import {Account} from '../../../components/account'
import {AddAccountCard} from '../../../components/addAccountCard'
import { formatMoney } from '../../../lib/utils/formatMoney'
import OptionsMenu from '../../../components/optionsmenu'
import { DatabaseError } from '../../../lib/errors'

const ITEM_SIZE = 193;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PADDING = (SCREEN_WIDTH - ITEM_SIZE) / 2;

export default function HomeScreen() {
    const { theme } = useTheme()
    const styles = useMemo(() => makeStyles(theme), [theme])
    const { t } = useTranslation()
    const router = useRouter()
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [creditCardSpendings, setCreditCardSpendings] = useState(null)

    async function fetchAccounts() {
        getAccounts().then((data) => { 
            setAccounts(data) 
            setLoading(false)
        })
    }

    useEffect(() => {
        setLoading(true)
        fetchAccounts()
    }, [])

    function onRefresh() {
        setRefreshing(true);
        setLoading(true)
        setAccounts([])
        fetchAccounts().then(() => setRefreshing(false));
    }

    const handleScroll = (event) => {
        event.persist();
        const offsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(offsetX / ITEM_SIZE)
        if (index !== selectedIndex) {
            setSelectedIndex(index)
            setCreditCardSpendings(null)
            if (accountsWithAddCard[index].account_type === 2) {
                getCreditCardSpendings(accountsWithAddCard[index].id, new Date().getFullYear(), new Date().getMonth()).then((data) => {
                    setCreditCardSpendings(data.reduce((acc, item) => acc + item.amount, 0))
                })
            }
        }
    };

    const accountsWithAddCard = [
        ...accounts,
        { id: 'add', name: t('accounts.addAccount'), isAddButton: true },
    ]

    const handleDeleteButton = () => {
        Alert.alert(
            t('accounts.deleteAccount.title'),
            t('accounts.deleteAccount.message', { accountName: accountsWithAddCard[selectedIndex].name }),
            [
                {
                    text: t('accounts.deleteAccount.cancel'),
                    style: "cancel"
                },
                {
                    text: t('accounts.deleteAccount.delete'),
                    onPress: async () => {
                        try {
                            await deleteAccount(accountsWithAddCard[selectedIndex].id)
                            setAccounts(accounts.filter((value)=>value.id !== accountsWithAddCard[selectedIndex].id))
                        } catch (error) {
                            Alert.alert(
                                t('shared.error'),
                                error instanceof DatabaseError ? t('accounts.errors.databaseError') : t('accounts.errors.deleteFailed'),
                                [{
                                    text: t('shared.ok'),
                                    style: "cancel"
                                }],
                                { cancelable: true }
                            )
                        }

                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        )
    }

    return (
        <View style={[styles.container, accountsStyle.cardContainer]}>
            {loading  && <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 20}} />}
            <View>
            <FlatList
                data={accountsWithAddCard}
                renderItem={({ item }) => {
                    if (item.isAddButton) {
                        return <AddAccountCard onClick={() => router.push('/(tabs)/accounts/newaccount')} />;
                    }
                    return <Account account={item} isSelected={item.id === accountsWithAddCard[selectedIndex].id} />;
                }}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={accountsStyle.listContent}
                snapToInterval={ITEM_SIZE}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={handleScroll}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.primary]}
                    />
                }
                />
            </View>
            {!loading && accountsWithAddCard[selectedIndex] && !accountsWithAddCard[selectedIndex].isAddButton &&
            <View style={accountsStyle.infoContainer}>
                <OptionsMenu>
                    <Link href={'/accounts/editaccount/' + accountsWithAddCard[selectedIndex].id} asChild>
                        <OptionsMenu.Item icon='edit' color="#c2bb00"/>
                    </Link>
                    <OptionsMenu.Item icon='delete' color="#e1523d" onPress={handleDeleteButton}/>
                </OptionsMenu>
                <View style={accountsStyle.propertyView}>
                    <Text style={styles.p}>{t('accounts.accountType')}</Text>
                    <Text style={styles.label}>{t(`accounts.types.${ACCOUNT_TYPES.find(type => type.id === accountsWithAddCard[selectedIndex].account_type).type}`)}</Text>
                </View>
                {2 === accountsWithAddCard[selectedIndex].account_type &&
                <View style={accountsStyle.propertyView}>
                    <Text style={styles.p}>{t('accounts.cutoffDate')}</Text>
                    <Text style={styles.label}>{accountsWithAddCard[selectedIndex].cutt_off_day??'N/A'}</Text>
                </View>
                }
                {2 === accountsWithAddCard[selectedIndex].account_type &&
                <View style={accountsStyle.propertyView}>
                    <Text style={styles.p}>{t('accounts.minimumPayment')}</Text>
                    <Text style={styles.label}>{creditCardSpendings?formatMoney(creditCardSpendings??0):'Loading'}</Text>
                </View>
                }
            </View>
            }
        </View>
    )
}

const accountsStyle = StyleSheet.create({
    cardContainer: {
        paddingVertical: 8,
        gap:20,
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    infoContainer: {
        padding: 17,
        flexDirection: 'column',
        gap: 20,
        flex: 1
    },
    listContent: {
        gap: 20,
        paddingHorizontal: SIDE_PADDING,
    },
    propertyView: {
        gap: 2
    },
    optionsMenu: {
        gap: 15,
        flexDirection:'row',
        justifyContent: 'flex-end'
    },
    label: {
        fontSize: 12,
        fontFamily: 'Montserrat-Regular'
    },
    data: {
        fontSize: 14,
        fontFamily: 'Montserrat-Medium'
    }
})