import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useThemeColors } from '../../../../theme/useThemeColors'
import { useLearning } from '../../../../contexts/LearningContext'
import BlockRenderer from '../../../../components/learning/BlockRenderer'
import { hasHabit } from '@repo/learning/progress'

export default function TopicScreen() {
  const { colors: theme } = useThemeColors()
  const { topicId } = useLocalSearchParams()
  const { content, topicProgress, markComplete, loading } = useLearning()

  const topic = content?.topics.find((t) => t.id === topicId)

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
        <Text style={{ color: statusColor, fontSize: 12, fontFamily: 'Quicksand-Bold', marginBottom: 16 }}>
          {statusLabel}
        </Text>
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
