import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text } from 'react-native';

import { OnboardingButton } from '@/components/OnboardingButton';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { Colors } from '@/constants/colors';

export default function Screen1() {
  const router = useRouter();

  return (
    <OnboardingLayout
      top={
        <Text style={styles.title}>
          {'Дом в порядке —\nжизнь в достатке!'}
        </Text>
      }
      center={
        <Image
          source={require('@/assets/images/chubrik1_clean.png')}
          style={styles.image}
        />
      }
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
    fontSize: 26,
    fontFamily: 'Nexa',
    color: Colors.text,
    textAlign: 'center',
  },
  image: {
    width: '75%',
    resizeMode: 'contain',
  },
});
