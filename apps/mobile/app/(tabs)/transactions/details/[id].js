import { Text, View, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from "react-native"
import { useState, useEffect, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { deleteTransaction, getTransaction } from "../../../../lib/supabase/transactions";
import { useTheme } from "../../../../theme/useTheme";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { makeStyles } from "../../../../assets/uiStyles";
import { APP_COLORS } from "../../../../constants/colors";
import { formatCurrency } from "../../../../lib/utils";

const getTransactionTypeIcon = (type) => {
  switch (type) {
    case 'income':
      return <Ionicons name="arrow-down" size={16} color="#10B981" />;
    case 'expense':
      return <Ionicons name="arrow-up" size={16} color="#EF4444" />;
    case 'transfer':
      return <Ionicons name="swap-horizontal" size={16} color="#3B82F6" />;
    case 'deferred':
      return <MaterialCommunityIcons name="clock-outline" size={16} color="#F59E0B" />;
    default:
      return <Ionicons name="receipt-outline" size={16} color="#6B7280" />;
  }
};

export default function TransactionDetails() {
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const router = useRouter()
  const { t } = useTranslation()
  const params = useLocalSearchParams()

  const id = Number(params.id)
  
  const [type, setType] = useState(params.type)
  const [transactionData, setTransactionData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransaction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getTransaction(id, params.type);
      
      if (!data) {
        setError(t('transactions.details.error.notFound'));
        return;
      }
      
      setTransactionData({ 
        ...data, 
        date: new Date(data.date).toLocaleString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour12: true,
          timeZone: "UTC"
        }),
        created_at: new Date(data.created_at).toLocaleString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC"
        }) 
      });

      if (data.deferred_id) {
        setType('deferred');
      } else {
        setType(params.type);
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      setError(t('transactions.details.error.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id, params.type]);

  const handleReturn = (result) => {
    if (result === true) {
      router.replace('/(tabs)/transactions');
    } else if (result && result.message) {
      Alert.alert(
        t('common.error'),
        t('common.error.message', { message: result.message }),
        [
          {
            text: t('common.ok'),
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
    }
  };

  const handleDeleteButton = () => {
    Alert.alert(
      t('transactions.details.delete.title'),
      t('transactions.details.delete.message', { type: t(`transactions.types.${type}`) }),
      [
        {
          text: t('transactions.details.delete.cancel'),
          style: "cancel"
        },
        {
          text: t('transactions.details.delete.delete'),
          onPress: async () => {
            if (type === 'deferred') {
              Alert.alert(
                t('transactions.details.delete.deferredTitle'),
                t('transactions.details.delete.deferredMessage'),
                [
                  {
                    text: t('transactions.details.delete.cancel'),
                    style: 'cancel'
                  },
                  {
                    text: t('transactions.details.delete.delete'),
                    onPress: async () => {
                      try {
                        const result = await deleteTransaction(transactionData.deferred_id, 'deferred');
                        handleReturn(result);
                      } catch (error) {
                        console.error('Error deleting deferred transaction:', error);
                        handleReturn({ message: t('common.error.unknown') });
                      }
                    },
                    style: 'destructive'
                  }
                ]
              );
            } else {
              try {
                const result = await deleteTransaction(id, type);
                handleReturn(result);
              } catch (error) {
                console.error('Error deleting transaction:', error);
                handleReturn({ message: t('common.error.unknown') });
              }
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const handleEditButton = () => {        
    router.push({
      pathname: `/transactions/edit/${id}`,
      params: { 
        ...transactionData,
        type
      }
    });
  };

  const handleRetry = () => {
    fetchTransaction();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={theme.error} style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transactionData) {
    return null;
  }

  const isIncome = type === 'income';
  const amountTextColor = isIncome ? styles.amountIncome : styles.amountExpense;
  const transactionTypeIconStyle = [
    styles.transactionTypeIcon,
    isIncome 
      ? styles.transactionTypeIconIncome 
      : type === 'expense' 
        ? styles.transactionTypeIconExpense 
        : styles.transactionTypeIconTransfer
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={transactionTypeIconStyle}>
            {getTransactionTypeIcon(type)}
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {t(`transactions.types.${type}`)}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>{t('transactions.amount')}</Text>
            <Text style={[styles.amount, amountTextColor]}>
              {isIncome ? '+' : '-'} {formatCurrency(transactionData.amount || 0)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('transactions.description')}</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {transactionData.description || t('transactions.details.noDescription')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('transactions.date')}</Text>
            <Text style={styles.detailValue}>
              {transactionData.date}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>{t('transactions.details.createdAt')}</Text>
            <Text style={styles.detailValue}>
              {transactionData.created_at}
            </Text>
          </View>
        </View>

        {type !== 'transfer' && transactionData.account_id && (
          <View style={styles.card}>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{t('transactions.details.account')}</Text>
              <Text style={styles.detailValue}>
                {transactionData.account_id}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.editButton]} 
          onPress={handleEditButton}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.editButtonText]}>
            {t('common.edit')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={handleDeleteButton}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
          <Text style={[styles.buttonText, styles.deleteButtonText]}>
            {t('common.delete')}
          </Text>
        </TouchableOpacity>
      </View>

            {!transactionData && (
                <ActivityIndicator size="large" color={APP_COLORS.PRIMARY} />
            )}
        </View>
    )
}