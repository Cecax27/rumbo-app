import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../../../theme/useThemeColors'
import { useLearning } from '../../../contexts/LearningContext'

export default function LearningIntro() {
  const { colors: theme } = useThemeColors()
  const router = useRouter()
  const { markIntroSeen, introSeen } = useLearning()

  const handleStart = async () => {
    await markIntroSeen()
    router.replace('/learning')
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 24, marginBottom: 16 }}>
        Antes de empezar
      </Text>

      <View style={{ gap: 14 }}>
        <Text style={{ color: theme.subtext, fontSize: 15, lineHeight: 22 }}>
          No necesitas leer todo de una sola vez, ni entenderlo todo en un solo día. El objetivo es
          simple:
        </Text>

        {[
          'Lee un tema.',
          'Entiéndelo.',
          'Pon en práctica su hábito.',
          'Pasa al siguiente tema solo cuando ese hábito esté establecido.',
        ].map((step, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Text style={{ color: theme.primary, fontFamily: 'Quicksand-Bold', fontSize: 15 }}>
              {i + 1}.
            </Text>
            <Text style={{ color: theme.subtext, fontSize: 15, lineHeight: 22, flex: 1 }}>{step}</Text>
          </View>
        ))}

        <Text style={{ color: theme.subtext, fontSize: 15, lineHeight: 22 }}>
          Al final, unas finanzas sanas no son de quien más sabe ni de quien más lee, sino de quien
          tiene los <Text style={{ fontFamily: 'Quicksand-Bold', color: theme.text }}>mejores hábitos</Text>.
        </Text>

        <Text style={{ color: theme.subtext, fontSize: 15, lineHeight: 22 }}>
          Los hábitos se construyen con constancia y paciencia, buscando mejorar un 1% cada día.
        </Text>
      </View>

      <Pressable
        onPress={handleStart}
        style={{
          marginTop: 24,
          alignSelf: 'flex-start',
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: theme.primary,
        }}
      >
        <Text style={{ color: '#1A1A1A', fontSize: 15, fontFamily: 'Quicksand-Bold' }}>
          {introSeen ? 'Volver al camino' : 'Comenzar'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}
