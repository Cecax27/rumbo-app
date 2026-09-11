import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useLearning } from '../../../contexts/LearningContext'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import PageContainer from '../../../components/layout/PageContainer'
import {
  computePosition,
  groupTopicsByLevel,
  hasHabit,
  levelCompletionPercentage,
} from '@repo/learning/progress'

/* ─── Segmented Progress Bar ─── */
function SegmentedProgress({ levels, topicsByLevel, progressByTopic, currentLevelIndex, theme }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.subtext, fontSize: 12, fontFamily: 'Quicksand-Bold' }}>
          Progreso general
        </Text>
        <Text style={{ color: theme.text, fontSize: 12, fontFamily: 'Quicksand-Bold' }}>
          {Math.round(
            levels.reduce(
              (sum, level) => sum + levelCompletionPercentage(level, topicsByLevel, progressByTopic),
              0
            ) / levels.length
          )}%
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {levels.map((level) => {
          const percent = levelCompletionPercentage(level, topicsByLevel, progressByTopic)
          const isCompleted = percent === 100
          const isCurrent = level.order === currentLevelIndex

          return (
            <View key={level.id} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  height: 6,
                  width: '100%',
                  borderRadius: 3,
                  backgroundColor: isCompleted
                    ? theme.success
                    : isCurrent
                      ? theme.primary
                      : theme.border,
                  overflow: 'hidden',
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Quicksand-Bold',
                  color: isCompleted
                    ? theme.success
                    : isCurrent
                      ? theme.text
                      : theme.subtext,
                }}
              >
                {level.order}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

/* ─── Hero Section ─── */
function HeroSection({ levels, topicsByLevel, progressByTopic, position, theme }) {
  const imageLevel = position.currentLevelIndex != null ? position.currentLevelIndex - 1 : 0
  const overallPercent =
    levels.length > 0
      ? Math.round(
          levels.reduce(
            (sum, level) =>
              sum + levelCompletionPercentage(level, topicsByLevel, progressByTopic),
            0,
          ) / levels.length,
        )
      : 0

  let illustrationSource
  try {
    illustrationSource = require('../../../assets/images/learning/0.png')
  } catch {
    illustrationSource = null
  }

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      {/* Top: Illustration */}
      {illustrationSource && (
        <View
          style={{
            width: '100%',
            height: 140,
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <Image
            source={illustrationSource}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Bottom: Text & Progress */}
      <View style={{ padding: 20, gap: 16 }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: theme.primary + '30',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="location" size={12} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 11, fontFamily: 'Quicksand-Bold' }}>
                {position.currentLevelIndex !== null
                  ? `Nivel ${position.currentLevelIndex} de ${position.totalLevels}`
                  : 'Comienza tu camino'}
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: theme.text,
              fontFamily: 'Quicksand-Bold',
              fontSize: 22,
              marginBottom: 4,
            }}
          >
            Camino de aprendizaje
          </Text>
          <Text style={{ color: theme.subtext, fontSize: 13, lineHeight: 18 }}>
            {overallPercent > 0
              ? `Llevas un ${overallPercent}% del camino. Cada nivel te acerca a unas finanzas más sanas.`
              : 'Empieza desde cero y construye hábitos financieros sólidos, paso a paso.'}
          </Text>
        </View>

        <SegmentedProgress
          levels={levels}
          topicsByLevel={topicsByLevel}
          progressByTopic={progressByTopic}
          currentLevelIndex={position.currentLevelIndex}
          theme={theme}
        />
      </View>
    </View>
  )
}

/* ─── Topic Row ─── */
function TopicRow({ topic, completed, inProgress, theme }) {
  const router = useRouter()
  const statusLabel = completed ? 'Listo' : inProgress ? 'Ahora' : ''
  const statusColor = completed ? theme.success : inProgress ? theme.primary : theme.subtext

  return (
    <Pressable
      onPress={() => router.push(`/learning/${topic.id}`)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      <Ionicons
        name={completed ? 'checkmark-circle' : inProgress ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={completed ? theme.success : inProgress ? theme.primary : theme.border}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              color: theme.text,
              fontFamily: 'Quicksand-Bold',
              fontSize: 15,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {topic.title}
          </Text>
          {statusLabel ? (
            <Text
              style={{
                color: statusColor,
                fontSize: 11,
                fontFamily: 'Quicksand-Bold',
              }}
            >
              {statusLabel}
            </Text>
          ) : null}
        </View>
        {topic.description ? (
          <Text
            style={{
              color: theme.subtext,
              fontSize: 13,
              marginTop: 2,
            }}
            numberOfLines={2}
          >
            {topic.description}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', marginTop: 6, gap: 12 }}>
          {hasHabit(topic) && (
            <Text style={{ color: theme.subtext, fontSize: 11 }}>Incluye hábito</Text>
          )}
          {topic.isSample && (
            <Text style={{ color: theme.subtext, fontSize: 11 }}>Ejemplo</Text>
          )}
        </View>
      </View>
    </Pressable>
  )
}

/* ─── Level Section ─── */
function LevelSection({
  level,
  topics,
  isCurrent,
  percent,
  completedMap,
  inProgressMap,
  isOpen,
  onToggle,
  theme,
}) {
  const { reset } = useLearning()
  const { t } = useTranslation()

  const confirmResetLevel = () => {
    Alert.alert(
      t('learning.reset.levelTitle') ?? 'Reiniciar nivel',
      t('learning.reset.levelMessage') ??
        '¿Reiniciar el progreso de este nivel? Esta acción no se puede deshacer.',
      [
        { text: t('common.cancel') ?? 'Cancelar', style: 'cancel' },
        {
          text: t('learning.reset.confirm') ?? 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await reset({ kind: 'level', levelId: level.id })
            if (error) {
              global.showSnackbar(
                t('learning.reset.error') ??
                  'No pudimos reiniciar tu progreso. Inténtalo de nuevo.',
                3000,
                theme.coral,
              )
            } else {
              global.showSnackbar(
                t('learning.reset.success') ?? 'Progreso de aprendizaje reiniciado.',
                3000,
                theme.success,
              )
            }
          },
        },
      ],
    )
  }

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Level header — clickable */}
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 16,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor:
              percent === 100
                ? theme.success + '20'
                : isCurrent
                  ? theme.primary + '30'
                  : theme.background,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color:
                percent === 100
                  ? theme.success
                  : isCurrent
                    ? theme.text
                    : theme.subtext,
              fontFamily: 'Quicksand-Bold',
              fontSize: 16,
            }}
          >
            {level.order}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: 'Quicksand-Bold',
                fontSize: 16,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {level.title}
            </Text>
            {isCurrent && (
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 11,
                  fontFamily: 'Quicksand-Bold',
                }}
              >
                Tu nivel
              </Text>
            )}
          </View>
          {level.description ? (
            <Text
              style={{ color: theme.subtext, fontSize: 13, marginTop: 2 }}
              numberOfLines={1}
            >
              {level.description}
            </Text>
          ) : null}
          <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>
            {topics.length} {topics.length === 1 ? 'tema' : 'temas'} · {percent}%
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={confirmResetLevel} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={theme.subtext} />
          </Pressable>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.background,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.text}
            />
          </View>
        </View>
      </Pressable>

      {/* Collapsible content */}
      {isOpen && (
        <View>
          {/* Progress bar */}
          <View
            style={{
              height: 4,
              backgroundColor: theme.background,
              marginHorizontal: 16,
              borderRadius: 2,
              overflow: 'hidden',
              marginBottom: 8,
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: percent === 100 ? theme.success : isCurrent ? theme.primary : theme.border,
                borderRadius: 2,
              }}
            />
          </View>

          {/* Topics */}
          <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
            {topics.map((topic, index) => (
              <View key={topic.id}>
                <TopicRow
                  topic={topic}
                  completed={completedMap.get(topic.id) ?? false}
                  inProgress={inProgressMap.get(topic.id) ?? false}
                  theme={theme}
                />
                {index < topics.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.border,
                      marginHorizontal: 8,
                      opacity: 0.4,
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

/* ─── Main Component ─── */
export default function LearningIndex() {
  const { colors: theme } = useThemeColors()
  const { t } = useTranslation()
  const router = useRouter()
  const { content, topicProgress, loading, error, introSeen } = useLearning()

  const [openLevels, setOpenLevels] = useState(new Set())

  const toggleLevel = useCallback((levelId) => {
    setOpenLevels((prev) => {
      const next = new Set(prev)
      if (next.has(levelId)) {
        next.delete(levelId)
      } else {
        next.add(levelId)
      }
      return next
    })
  }, [])

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
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
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
          <Text style={{ color: theme.subtext }}>
            {t('learning.empty') ?? 'Aún no hay contenido disponible.'}
          </Text>
        </View>
      </PageContainer>
    )
  }

  const progressByTopic = new Map(
    Array.from(topicProgress.values()).map((p) => [p.topicId, p]),
  )
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

  // Default open: current level, or first level if none current
  const defaultOpenId = position.currentLevel?.id ?? visibleLevels[0]?.id ?? null
  const effectiveOpenLevels =
    openLevels.size === 0 && defaultOpenId ? new Set([defaultOpenId]) : openLevels

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Hero */}
        <HeroSection
          levels={visibleLevels}
          topicsByLevel={topicsByLevel}
          progressByTopic={progressByTopic}
          position={position}
          theme={theme}
        />

        {/* Levels */}
        {visibleLevels.length === 0 ? (
          <Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 40 }}>
            {t('learning.empty') ?? 'Aún no hay niveles disponibles.'}
          </Text>
        ) : (
          visibleLevels.map((level) => (
            <LevelSection
              key={level.id}
              level={level}
              topics={topicsByLevel.get(level.id) ?? []}
              isCurrent={position.currentLevel?.id === level.id}
              percent={levelCompletionPercentage(level, topicsByLevel, progressByTopic)}
              completedMap={completedMap}
              inProgressMap={inProgressMap}
              isOpen={effectiveOpenLevels.has(level.id)}
              onToggle={() => toggleLevel(level.id)}
              theme={theme}
            />
          ))
        )}
      </ScrollView>
    </PageContainer>
  )
}
