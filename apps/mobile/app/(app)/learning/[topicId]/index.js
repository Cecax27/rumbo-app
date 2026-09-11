import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useThemeColors } from '../../../../theme/useThemeColors'
import { useLearning } from '../../../../contexts/LearningContext'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import BlockRenderer from '../../../../components/learning/BlockRenderer'
import { hasHabit } from '@repo/learning/progress'

export default function TopicScreen() {
  const { colors: theme } = useThemeColors()
  const { t } = useTranslation()
  const { topicId } = useLocalSearchParams()
  const { content, topicProgress, markComplete, loading, reset } = useLearning()

  const topic = content?.topics.find((t) => t.id === topicId)

  const confirmResetTopic = () => {
    Alert.alert(
      t('learning.reset.topicTitle') ?? 'Reiniciar tema',
      t('learning.reset.topicMessage') ?? '¿Reiniciar el progreso de este tema? Esta acción no se puede deshacer.',
      [
        { text: t('common.cancel') ?? 'Cancelar', style: 'cancel' },
        {
          text: t('learning.reset.confirm') ?? 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await reset({ kind: 'topic', topicId })
            if (error) {
              global.showSnackbar(t('learning.reset.error') ?? 'No pudimos reiniciar tu progreso. Inténtalo de nuevo.', 3000, theme.coral)
            } else {
              global.showSnackbar(t('learning.reset.success') ?? 'Progreso de aprendizaje reiniciado.', 3000, theme.success)
            }
          },
        },
      ]
    )
  }

  if (loading && !content) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    )
  }

  if (!topic) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.subtext }}>Tema no encontrado.</Text>
      </View>
    )
  }

  const tp = topicProgress.get(topic.id)
  const statusLabel = tp?.status === 'completed' ? 'Completado' : tp?.status === 'in_progress' ? 'En progreso' : 'No iniciado'
  const statusColor = tp?.status === 'completed' ? theme.success : tp?.status === 'in_progress' ? theme.primary : theme.subtext
  const topicHasHabit = hasHabit(topic)

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: topic.title }} />

      <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 24, marginBottom: 4 }}>
        {topic.title}
      </Text>
      {topic.description ? (
        <Text style={{ color: theme.subtext, fontSize: 14, marginBottom: 8 }}>{topic.description}</Text>
      ) : null}
      {tp ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: statusColor, fontSize: 12, fontFamily: 'Quicksand-Bold' }}>
            {statusLabel}
          </Text>
          <Pressable onPress={confirmResetTopic} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={theme.subtext} />
          </Pressable>
        </View>
      ) : null}

      <View style={{ gap: 14 }}>
        {topic.blocks.map((block, index) => (
          <BlockRenderer key={block.id} block={block} topicId={topic.id} index={index} />
        ))}
      </View>

      {tp?.status !== 'completed' && !topicHasHabit ? (
        <Pressable
          onPress={() => markComplete(topic.id)}
          style={{
            marginTop: 20,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: theme.primary,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#1A1A1A', fontSize: 15, fontFamily: 'Quicksand-Bold' }}>
            Marcar tema como completado
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}
