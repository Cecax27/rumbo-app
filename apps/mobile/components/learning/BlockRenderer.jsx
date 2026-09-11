import { View, Text, Pressable, Image, Share, TextInput } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../../theme/useThemeColors'
import { useLearning } from '../../contexts/LearningContext'
import InlineText from './InlineText'
import { Ionicons } from '@expo/vector-icons'

/* ─── Small label above a block ─── */
function BlockLabel({ children, theme, color }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color ?? theme.primary,
        }}
      />
      <Text
        style={{
          color: color ?? theme.primary,
          fontSize: 11,
          fontFamily: 'Quicksand-Bold',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
    </View>
  )
}

/* ─── Flat block with optional left accent line ─── */
function FlatBlock({ children, theme, accent, icon }) {
  return (
    <View style={{ paddingVertical: 16 }}>
      {icon && (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: (accent ?? theme.primary) + '18',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons name={icon} size={18} color={accent ?? theme.primary} />
        </View>
      )}
      {children}
    </View>
  )
}

function BlockTitle({ children, theme, size = 17 }) {
  return (
    <InlineText
      style={{
        color: theme.text,
        fontFamily: 'Quicksand-Bold',
        fontSize: size,
        lineHeight: size + 4,
      }}
    >
      {children}
    </InlineText>
  )
}

function Body({ children, theme, color, italic = false }) {
  return (
    <InlineText
      style={{
        color: color ?? theme.subtext,
        marginTop: 6,
        lineHeight: 22,
        fontStyle: italic ? 'italic' : 'normal',
      }}
    >
      {children}
    </InlineText>
  )
}

function Separator({ theme }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.border,
        opacity: 0.35,
        marginHorizontal: -16,
      }}
    />
  )
}

/* ─── Blocks ─── */

function ConceptBlock({ block, theme }) {
  return (
    <FlatBlock theme={theme}>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme}>{block.payload.body}</Body>
    </FlatBlock>
  )
}

function ExplanationBlock({ block, theme }) {
  return (
    <View style={{ paddingVertical: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: theme.mint }}>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme}>{block.payload.body}</Body>
    </View>
  )
}

function TipBlock({ block, theme }) {
  return (
    <View style={{ paddingVertical: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: theme.primary }}>
      <BlockLabel theme={theme} color={theme.primary}>Consejo</BlockLabel>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme}>{block.payload.body}</Body>
    </View>
  )
}

function WarningBlock({ block, theme }) {
  return (
    <View style={{ paddingVertical: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: theme.spending }}>
      <BlockLabel theme={theme} color={theme.spending}>Advertencia</BlockLabel>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme}>{block.payload.body}</Body>
    </View>
  )
}

function ExampleBlock({ block, theme }) {
  return (
    <FlatBlock theme={theme}>
      <BlockLabel theme={theme} color={theme.subtext}>Ejemplo</BlockLabel>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme}>{block.payload.body}</Body>
    </FlatBlock>
  )
}

function ReflectionBlock({ block, theme }) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <FlatBlock theme={theme} icon="chatbubble-ellipses-outline">
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme} italic>{block.payload.prompt}</Body>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Escribe tus reflexiones aquí..."
        placeholderTextColor={theme.subtext}
        multiline
        numberOfLines={3}
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.background,
          color: theme.text,
          fontSize: 14,
          lineHeight: 20,
          textAlignVertical: 'top',
          minHeight: 80,
        }}
      />
      <Pressable
        onPress={() => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
        style={{
          marginTop: 10,
          alignSelf: 'flex-start',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: saved ? theme.success + '20' : theme.background,
          borderWidth: 1,
          borderColor: saved ? theme.success : theme.border,
        }}
      >
        <Text
          style={{
            color: saved ? theme.success : theme.text,
            fontSize: 13,
            fontFamily: 'Quicksand-Bold',
          }}
        >
          {saved ? 'Guardado' : 'Guardar nota'}
        </Text>
      </Pressable>
    </FlatBlock>
  )
}

function ExerciseBlock({ block, theme }) {
  return (
    <FlatBlock theme={theme} icon="fitness-outline">
      <BlockLabel theme={theme} color={theme.subtext}>Ejercicio</BlockLabel>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Body theme={theme}>{block.payload.body}</Body>
      <View
        style={{
          marginTop: 14,
          padding: 16,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.border,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.subtext, fontSize: 12 }}>Interactividad próximamente</Text>
      </View>
    </FlatBlock>
  )
}

function QuoteBlock({ block, theme }) {
  return (
    <View style={{ paddingVertical: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: theme.mint }}>
      <Body theme={theme} color={theme.text} italic>{block.payload.text}</Body>
      {block.payload.author ? (
        <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 6, fontFamily: 'Quicksand-Bold' }}>
          — {block.payload.author}
        </Text>
      ) : null}
    </View>
  )
}

function TableBlock({ block, theme }) {
  const { headers, rows } = block.payload
  return (
    <View style={{ paddingVertical: 16 }}>
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
    </View>
  )
}

function InfographicBlock({ block, theme }) {
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
    <View style={{ paddingVertical: 16 }}>
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
    </View>
  )
}

function IllustrationBlock({ block, theme }) {
  return (
    <View style={{ paddingVertical: 16 }}>
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
    </View>
  )
}

function TutorialBlock({ block, topicId, index, theme }) {
  const router = useRouter()
  return (
    <View style={{ paddingVertical: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: theme.text }}>
      <BlockLabel theme={theme} color={theme.text}>Tutorial</BlockLabel>
      <BlockTitle theme={theme}>{block.payload.title}</BlockTitle>
      <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>
        {block.payload.steps.length} pasos
      </Text>
      <Pressable
        onPress={() => router.push(`/learning/${topicId}/tutorial/${index}`)}
        style={{
          marginTop: 12,
          alignSelf: 'flex-start',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Quicksand-Bold' }}>
          Abrir tutorial
        </Text>
      </Pressable>
    </View>
  )
}

function HabitBlock({ block, topicId, theme }) {
  const { habitProgress, evaluate, startHabit } = useLearning()

  const payload = block.payload
  const progress = habitProgress.get(`${topicId}:${payload.habitSlug}`)
  const isCompleted = progress?.status === 'completed'
  const isTracking = progress?.status === 'tracking'
  const evaluation = evaluate(block, topicId)
  const percent = Math.round(evaluation.progress * 100)

  const statusLabel = isCompleted
    ? 'Completado'
    : isTracking
      ? 'En seguimiento'
      : 'Sin iniciar'
  const statusColor = isCompleted ? theme.success : isTracking ? theme.primary : theme.subtext

  return (
    <View style={{ paddingVertical: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: theme.success }}>
      <BlockLabel theme={theme} color={theme.success}>Hábito</BlockLabel>

      {/* Title + status stacked vertically to prevent overflow */}
      <BlockTitle theme={theme}>{payload.title}</BlockTitle>
      <Text
        style={{
          color: statusColor,
          fontSize: 12,
          fontFamily: 'Quicksand-Bold',
          marginTop: 4,
        }}
      >
        {statusLabel}
      </Text>

      <Body theme={theme}>{payload.description}</Body>

      {isCompleted ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <Ionicons name="checkmark-circle" size={16} color={theme.success} />
          <Text style={{ color: theme.success, fontSize: 13, fontFamily: 'Quicksand-Bold' }}>
            Completaste este hábito.
          </Text>
        </View>
      ) : isTracking ? (
        <View style={{ marginTop: 12 }}>
          <View style={{ height: 8, backgroundColor: theme.background, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.success }} />
          </View>
          <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>
            Progreso del hábito: <Text style={{ fontFamily: 'Quicksand-Bold' }}>{percent}%</Text>
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => startHabit(topicId, payload.habitSlug)}
          style={{
            marginTop: 12,
            alignSelf: 'flex-start',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: theme.success + '18',
            borderWidth: 1,
            borderColor: theme.success + '40',
          }}
        >
          <Text style={{ color: theme.success, fontSize: 13, fontFamily: 'Quicksand-Bold' }}>
            Empezar hábito
          </Text>
        </Pressable>
      )}
    </View>
  )
}

/* ─── Main Renderer ─── */
export default function BlockRenderer({ block, topicId, index }) {
  const { colors: theme } = useThemeColors()

  switch (block.type) {
    case 'concept':
      return <ConceptBlock block={block} theme={theme} />
    case 'explanation':
      return <ExplanationBlock block={block} theme={theme} />
    case 'tip':
      return <TipBlock block={block} theme={theme} />
    case 'warning':
      return <WarningBlock block={block} theme={theme} />
    case 'example':
      return <ExampleBlock block={block} theme={theme} />
    case 'reflection':
      return <ReflectionBlock block={block} theme={theme} />
    case 'exercise':
      return <ExerciseBlock block={block} theme={theme} />
    case 'heading':
      return (
        <View style={{ paddingVertical: 12 }}>
          <BlockTitle theme={theme} size={block.payload.level === 2 ? 22 : 18}>
            {block.payload.text}
          </BlockTitle>
        </View>
      )
    case 'quote':
      return <QuoteBlock block={block} theme={theme} />
    case 'table':
      return <TableBlock block={block} theme={theme} />
    case 'infographic':
      return <InfographicBlock block={block} theme={theme} />
    case 'illustration':
      return <IllustrationBlock block={block} theme={theme} />
    case 'tutorial':
      return <TutorialBlock block={block} topicId={topicId} index={index} theme={theme} />
    case 'habit':
      return <HabitBlock block={block} topicId={topicId} theme={theme} />
    default:
      return (
        <View style={{ paddingVertical: 16 }}>
          <Text style={{ color: theme.subtext, fontSize: 13 }}>
            Tipo de bloque no soportado.
          </Text>
        </View>
      )
  }
}
