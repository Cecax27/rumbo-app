import { View, Text, Pressable, Image, Share } from 'react-native'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../../theme/useThemeColors'
import { useLearning } from '../../contexts/LearningContext'
import InlineText from './InlineText'

function Card({ children, theme, accent }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        padding: 14,
        backgroundColor: theme.surface,
        borderLeftWidth: accent ? 4 : 1,
        borderLeftColor: accent ?? theme.border,
      }}
    >
      {children}
    </View>
  )
}

function BlockTitle({ children, theme, size = 16 }) {
  return (
    <InlineText
      style={{
        color: theme.text,
        fontFamily: 'Quicksand-Bold',
        fontSize: size,
      }}
    >
      {children}
    </InlineText>
  )
}

function Body({ children, theme, color }) {
  return (
    <InlineText style={{ color: color ?? theme.subtext, marginTop: 4, lineHeight: 20 }}>
      {children}
    </InlineText>
  )
}

function InfographicBlock({ block }) {
  const { colors: theme } = useThemeColors()

  const handleShare = async () => {
    try {
      await Share.share({
        message: block.payload.imagePath,
        title: block.payload.title ?? block.payload.altText,
        url: block.payload.imagePath,
      })
    } catch {
      // user cancelled or share unavailable
    }
  }

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: theme.surface,
      }}
    >
      <Image
        source={{ uri: block.payload.imagePath }}
        style={{ width: '100%', height: 200 }}
        resizeMode="contain"
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
        }}
      >
        <InlineText style={{ color: theme.text, fontSize: 13 }}>
          {block.payload.title ?? 'Infografía'}
        </InlineText>
        <Pressable
          onPress={handleShare}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: theme.background,
          }}
        >
          <Text style={{ color: theme.primary, fontSize: 12, fontFamily: 'Quicksand-Bold' }}>
            Compartir
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

function IllustrationBlock({ block }) {
  const { colors: theme } = useThemeColors()
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: theme.surface,
      }}
    >
      <Image
        source={{ uri: block.payload.imagePath }}
        style={{ width: '100%', height: 200 }}
        resizeMode="contain"
      />
      {block.payload.caption ? (
        <Text style={{ padding: 10, color: theme.subtext, fontSize: 13 }}>
          {block.payload.caption}
        </Text>
      ) : null}
    </View>
  )
}

function TableBlock({ block }) {
  const { colors: theme } = useThemeColors()
  const { headers, rows } = block.payload
  return (
    <View style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', backgroundColor: theme.background }}>
        {headers.map((h, i) => (
          <View key={i} style={{ flex: 1, padding: 8 }}>
            <InlineText style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 13 }}>
              {h}
            </InlineText>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.border }}
        >
          {row.map((cell, ci) => (
            <View key={ci} style={{ flex: 1, padding: 8 }}>
              <InlineText style={{ color: theme.subtext, fontSize: 13 }}>{cell}</InlineText>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

function HabitBlock({ block, topicId }) {
  const { colors: theme } = useThemeColors()
  const { habitProgress, evaluate, startHabit } = useLearning()

  const payload = block.payload
  const progress = habitProgress.get(`${topicId}:${payload.habitSlug}`)
  const isCompleted = progress?.status === 'completed'
  const isTracking = progress?.status === 'tracking'
  const evaluation = evaluate(block, topicId)
  const percent = Math.round(evaluation.progress * 100)

  const statusLabel = isCompleted
    ? 'Hábito completado'
    : isTracking
      ? 'En seguimiento'
      : 'No iniciado'
  const statusColor = isCompleted ? theme.success : isTracking ? theme.primary : theme.subtext

  return (
    <Card theme={theme} accent={theme.success}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BlockTitle theme={theme}>{payload.title}</BlockTitle>
        <Text style={{ color: statusColor, fontSize: 11, fontFamily: 'Quicksand-Bold' }}>
          {statusLabel}
        </Text>
      </View>
      <Body theme={theme}>{payload.description}</Body>

      {isCompleted ? (
        <Text style={{ color: theme.success, marginTop: 10, fontSize: 13, fontFamily: 'Quicksand-Bold' }}>
          Completaste este hábito.
        </Text>
      ) : isTracking ? (
        <View style={{ marginTop: 10 }}>
          <View style={{ height: 8, backgroundColor: theme.background, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.success }} />
          </View>
          <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>
            Progreso del hábito: {percent}%
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => startHabit(topicId, payload.habitSlug)}
          style={{
            marginTop: 10,
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: theme.primary,
          }}
        >
          <Text style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Quicksand-Bold' }}>
            Empezar hábito
          </Text>
        </Pressable>
      )}
    </Card>
  )
}

function TutorialBlock({ block, topicId, index }) {
  const { colors: theme } = useThemeColors()
  const router = useRouter()
  return (
    <Card theme={theme} accent={theme.text}>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 2 }}>
        {block.payload.steps.length} pasos
      </Text>
      <Pressable
        onPress={() => router.push(`/learning/${topicId}/tutorial/${index}`)}
        style={{
          marginTop: 10,
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Quicksand-Bold' }}>
          Abrir tutorial
        </Text>
      </Pressable>
    </Card>
  )
}

export default function BlockRenderer({ block, topicId, index }) {
  const { colors: theme } = useThemeColors()

  switch (block.type) {
    case 'concept':
    case 'explanation':
      return (
        <Card theme={theme} accent={block.type === 'explanation' ? theme.mint : undefined}>
          <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
          <Body theme={theme}>{block.payload.body}</Body>
        </Card>
      )
    case 'tip':
      return (
        <Card theme={theme} accent={theme.primary}>
          <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
          <Body theme={theme}>{block.payload.body}</Body>
        </Card>
      )
    case 'warning':
      return (
        <Card theme={theme} accent={theme.spending}>
          <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
          <Body theme={theme}>{block.payload.body}</Body>
        </Card>
      )
    case 'example':
      return (
        <Card theme={theme}>
          <Text style={{ color: theme.mint, fontSize: 11, fontFamily: 'Quicksand-Bold' }}>
            EJEMPLO
          </Text>
          <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
          <Body theme={theme}>{block.payload.body}</Body>
        </Card>
      )
    case 'reflection':
      return (
        <Card theme={theme}>
          <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
          <Body theme={theme} color={theme.subtext}>
            {block.payload.prompt}
          </Body>
        </Card>
      )
    case 'exercise':
      return (
        <Card theme={theme}>
          <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
          <Body theme={theme}>{block.payload.body}</Body>
          <View
            style={{
              marginTop: 10,
              padding: 16,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: theme.border,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Interactividad próximamente</Text>
          </View>
        </Card>
      )
    case 'heading':
      return (
        <BlockTitle theme={theme} size={block.payload.level === 2 ? 20 : 17}>
          {block.payload.text}
        </BlockTitle>
      )
    case 'quote':
      return (
        <View style={{ borderLeftWidth: 4, borderLeftColor: theme.mint, paddingLeft: 12 }}>
          <Body theme={theme}>{block.payload.text}</Body>
          {block.payload.author ? (
            <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>
              — {block.payload.author}
            </Text>
          ) : null}
        </View>
      )
    case 'table':
      return <TableBlock block={block} />
    case 'infographic':
      return <InfographicBlock block={block} />
    case 'illustration':
      return <IllustrationBlock block={block} />
    case 'tutorial':
      return <TutorialBlock block={block} topicId={topicId} index={index} />
    case 'habit':
      return <HabitBlock block={block} topicId={topicId} />
    default:
      return (
        <Card theme={theme}>
          <Text style={{ color: theme.subtext, fontSize: 13 }}>
            Tipo de bloque no soportado.
          </Text>
        </Card>
      )
  }
}
