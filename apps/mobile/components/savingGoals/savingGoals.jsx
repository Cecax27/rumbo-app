import { View, Pressable, Text, Image, FlatList } from 'react-native'
import { useSavingGoals } from '../../hooks/useSavingGoals'
import { useTheme } from '../../theme/useTheme'
import { makeStyles } from '../../assets/uiStyles'
import { useMemo, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { t } from 'i18next'
import { MaterialIcons } from '@expo/vector-icons'

export function SavingGoals() {
  const { savingGoals, fetchSavingGoals } = useSavingGoals()
  const { theme } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const router = useRouter()

  useEffect(() => { fetchSavingGoals() }, [fetchSavingGoals])

  return (
    <>
      {savingGoals.length === 0 && (
        <View style={[styles.container, { alignItems: 'center', gap: 20 }]}>
          <MaterialIcons name="search-off" size={64} color={theme.subtext} />
          <Text style={[styles.p, { textAlign: 'center', color: theme.subtext }]}>
            {t('dashboard.noSavingGoals')}
          </Text>
        </View>
      )}
      <FlatList
        data={savingGoals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.toolCard}
            onPress={() => router.push(`/dashboard/savingGoalDetail/${item.id}`)}
          >
            <View style={styles.toolCardContent}>
              <Image source={require("../../assets/icons/budget.png")} style={styles.toolIcon} />
              <Text style={styles.toolTitle}>{item.name}</Text>
              {item.range_type ? (
                <Text style={styles.toolSubtitle}>{t(`savingGoal.types.${item.range_type}`)}</Text>
              ) : null}
              <Text style={[styles.cardSubtitle, { color: theme.text }]}></Text>
            </View>
          </Pressable>
        )}
      />
    </>
  )
}
