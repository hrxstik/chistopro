import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { OnboardingButton } from '@/components/OnboardingButton';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { OnboardingMascot } from '@/components/OnboardingMascot';
import { Colors } from '@/constants/colors';

export default function Screen1() {
  const router = useRouter();

  return (
    <OnboardingLayout
      top={
        <Text style={styles.title}>
          Дом в порядке — жизнь в достатке!
        </Text>
      }
      center={<OnboardingMascot variant="clean" />}
      bottom={
        <OnboardingButton
          title="Начать"
          onPress={() => router.push('/onboarding/screen2')}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
