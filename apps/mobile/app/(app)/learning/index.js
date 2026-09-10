import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useLearning } from '../../../contexts/LearningContext'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../../components/layout/PageContainer'
import {
  computePosition,
  groupTopicsByLevel,
  hasHabit,
  levelCompletionPercentage,
} from '@repo/learning/progress'

function LevelCard({ level, topics, isCurrent, percent, completedMap, inProgressMap, theme }) {
  const router = useRouter()

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontFamily: 'Quicksand-Bold',
              fontSize: 18,
              flexShrink: 1,
            }}
          >
            {level.title}
          </Text>
          {isCurrent && (
            <Text
              style={{
                marginLeft: 8,
                color: theme.mint,
                fontSize: 11,
                fontFamily: 'Quicksand-Bold',
              }}
            >
              Nivel actual
            </Text>
          )}
        </View>
        <Text style={{ color: theme.subtext, fontSize: 14, fontFamily: 'Quicksand-Bold' }}>
          {percent}%
        </Text>
      </View>

      <View style={{ height: 8, backgroundColor: theme.background, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.mint }} />
      </View>

      {level.description ? (
        <Text style={{ color: theme.subtext, fontSize: 13, marginTop: 6 }}>{level.description}</Text>
      ) : null}

      <View style={{ gap: 10, marginTop: 12 }}>
        {topics.map((topic) => {
          const completed = completedMap.get(topic.id) ?? false
          const inProgress = inProgressMap.get(topic.id) ?? false
          const statusLabel = completed ? 'Completado' : inProgress ? 'En progreso' : 'No iniciado'
          const statusColor = completed ? theme.success : inProgress ? theme.primary : theme.subtext

          return (
            <Pressable
              key={topic.id}
              onPress={() => router.push(`/learning/${topic.id}`)}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 10,
                padding: 14,
                backgroundColor: theme.surface,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 15, flex: 1 }}>
                  {topic.title}
                </Text>
                <Text style={{ color: statusColor, fontSize: 11, fontFamily: 'Quicksand-Bold', marginLeft: 8 }}>
                  {statusLabel}
                </Text>
              </View>
              {topic.description ? (
                <Text style={{ color: theme.subtext, fontSize: 13, marginTop: 4 }}>{topic.description}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                {hasHabit(topic) && (
                  <Text style={{ color: theme.subtext, fontSize: 11 }}>Incluye hábito</Text>
                )}
                {topic.isSample && (
                  <Text style={{ color: theme.subtext, fontSize: 11 }}>· Ejemplo</Text>
                )}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function LearningIndex() {
  const { colors: theme } = useThemeColors()
  const { t } = useTranslation()
  const router = useRouter()
  const { content, topicProgress, loading, error, introSeen } = useLearning()

  useEffect(() => {
    if (!loading && !introSeen) {
      router.replace('/learning/intro')
    }
  }, [loading, introSeen, router])

  if (loading && !content) {
    return (
      <PageContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </PageContainer>
    )
  }

  if (error && !content) {
    return (
      <PageContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: theme.subtext, textAlign: 'center' }}>
            {t('learning.error') ?? 'No pudimos cargar el contenido. Reintenta más tarde.'}
          </Text>
        </View>
      </PageContainer>
    )
  }

  if (!content) {
    return (
      <PageContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.subtext }}>{t('learning.empty') ?? 'Aún no hay contenido disponible.'}</Text>
        </View>
      </PageContainer>
    )
  }

  const progressByTopic = new Map(Array.from(topicProgress.values()).map((p) => [p.topicId, p]))
  const topicsByLevel = groupTopicsByLevel(content.levels, content.topics)
  const position = computePosition(content.levels, topicsByLevel, progressByTopic)

  const visibleLevels = [...content.levels]
    .filter((level) => (topicsByLevel.get(level.id) ?? []).length > 0)
    .sort((a, b) => a.order - b.order)

  const completedMap = new Map()
  const inProgressMap = new Map()
  for (const [topicId, p] of topicProgress) {
    if (p.status === 'completed') completedMap.set(topicId, true)
    else inProgressMap.set(topicId, true)
  }

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 24, marginBottom: 4 }}>
          {t('learning.title') ?? 'Camino de aprendizaje'}
        </Text>
        <Text style={{ color: theme.subtext, fontSize: 14, marginBottom: 20 }}>
          {position.currentLevelIndex !== null
            ? `${t('learning.level') ?? 'Nivel'} ${position.currentLevelIndex} ${t('learning.of') ?? 'de'} ${position.totalLevels}`
            : t('learning.comingSoon') ?? 'Próximamente habrá contenido disponible.'}
        </Text>

        {visibleLevels.length === 0 ? (
          <Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 40 }}>
            {t('learning.empty') ?? 'Aún no hay niveles disponibles.'}
          </Text>
        ) : (
          visibleLevels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              topics={topicsByLevel.get(level.id) ?? []}
              isCurrent={position.currentLevel?.id === level.id}
              percent={levelCompletionPercentage(level, topicsByLevel, progressByTopic)}
              completedMap={completedMap}
              inProgressMap={inProgressMap}
              theme={theme}
            />
          ))
        )}
      </ScrollView>
    </PageContainer>
  )
}
