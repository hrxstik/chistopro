import { CloudSmall } from '@/components/CloudSmall';
import { OnboardingButton } from '@/components/OnboardingButton';
import { QuestionnaireLayout } from '@/components/QuestionnaireLayout';
import { RadioButton } from '@/components/RadioButton';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
export default function Step2() {
  const router = useRouter();
  const [profession, setProfession] = useState<string | null>(null);
  return (
    <QuestionnaireLayout
    showBack
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image
            source={require('@/assets/images/chubrik1_dirty1.png')}
            style={{ width: 121, height: 181 }}
          />
          <CloudSmall text={"Выбери вид\nтвоей профессии"} />
        </View>
      }
      footer={<OnboardingButton title="Продолжить" disabled={!profession} onPress={() => router.push('/questionnaire/step3')} />}
    >
      <Text style={{ marginBottom: 6, fontFamily: 'Nexa', fontSize: 15, }}>Ваша профессия:</Text>
{[
  'Безработный',
  'Студент',
  'Удалёнщик',
  'Офисный работник',
  'Гибридный работник',
  'Уличный работник',
].map((item) => (
  <RadioButton
    key={item}
    label={item}
    selected={profession === item}
    onPress={() => setProfession(item)}
    borderColor={Colors.primary}
  />
))}
    </QuestionnaireLayout>
  );
}
