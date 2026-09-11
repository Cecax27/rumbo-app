import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useThemeColors } from '../../../../../theme/useThemeColors'
import { useLearning } from '../../../../../contexts/LearningContext'
import InlineText from '../../../../../components/learning/InlineText'

export default function TutorialScreen() {
  const { colors: theme } = useThemeColors()
  const { topicId, tutorialId } = useLocalSearchParams()
  const { content, loading } = useLearning()

  const topic = content?.topics.find((t) => t.id === topicId)
  const index = Number.parseInt(tutorialId, 10)
  const block = topic?.blocks[index]

  if (loading && !content) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    )
  }

  if (!block || block.type !== 'tutorial') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.subtext }}>Tutorial no encontrado.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: block.payload.title }} />

      <View style={{ gap: 14 }}>
        {block.payload.steps.map((step, i) => (
          <View
            key={i}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              padding: 14,
              backgroundColor: theme.surface,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.mint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#1A1A1A', fontFamily: 'Quicksand-Bold', fontSize: 13 }}>
                  {i + 1}
                </Text>
              </View>
              <InlineText style={{ color: theme.subtext, fontSize: 14, lineHeight: 21, flex: 1 }}>
                {step.text}
              </InlineText>
            </View>
            {step.imagePath ? (
              <Image
                source={{ uri: step.imagePath }}
                style={{ width: '100%', height: 180, marginTop: 10, borderRadius: 8 }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
