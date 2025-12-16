import { CloudSmall } from '@/components/CloudSmall';
import { InputField } from '@/components/InputField';
import { OnboardingButton } from '@/components/OnboardingButton';
import { QuestionnaireLayout } from '@/components/QuestionnaireLayout';
import { RadioButton } from '@/components/RadioButton';
import { SelectField } from '@/components/SelectField';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
export default function Step1() {
  const router = useRouter();
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [timezone, setTimezone] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const isValid =
  name.trim() !== '' &&
  age.trim() !== '' &&
  gender !== null &&
  timezone !== '';

  return (
    <QuestionnaireLayout
    showBack
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image
            source={require('@/assets/images/chubrik1_dirty1.png')}
            style={{ width: 121, height: 181 }}
          />
          <CloudSmall text={'Расскажи\nнемного о себе'} />
        </View>
      }
      footer={
        <OnboardingButton
          title="Продолжить"
          disabled={!isValid}
          onPress={() => router.push('/questionnaire/step2')}
        />
      }
    >
<InputField
  label="Имя:"
  value={name}
  onChangeText={setName}
/>

<InputField
  label="Возраст:"
  value={age}
  onChangeText={setAge}
  keyboardType="numeric"
  min={0}
  max={100}
/>

      <Text style={{ marginBottom: 6, fontFamily: 'Nexa', fontSize: 15, }}>Пол:</Text>
<RadioButton
  label="Мужской"
  selected={gender === 'male'}
  onPress={() => setGender('male')}
  borderColor={Colors.primary}
/>

<RadioButton
  label="Женский"
  selected={gender === 'female'}
  onPress={() => setGender('female')}
  borderColor={Colors.red}
/>
      <SelectField
  label="Часовой пояс:"
  value={timezone}
  onChange={setTimezone}
  options={[
    'Москва (GMT +3)',
    'Калининград (GMT +2)',
    'Самара (GMT +4)',
    'Екатеринбург (GMT +5)',
  ]}
/>


    </QuestionnaireLayout>
  );
}
