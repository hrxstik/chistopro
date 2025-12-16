import { useRouter } from 'expo-router';

import { OnboardingButton } from '@/components/OnboardingButton';
import { OnboardingCloud } from '@/components/OnboardingCloud';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { Image, StyleSheet } from 'react-native';
export default function Screen2() {
  const router = useRouter();

  return (
    <OnboardingLayout
      top={
        <OnboardingCloud
          text={'Привет, я Чубрик!\nДавай вместе убираться дома!'}
        />
      }
      center={
        <Image
          source={require('@/assets/images/chubrik1_dirty1.png')}
          style={styles.image}
        />
      }
      bottom={
        <OnboardingButton
          title="Продолжить"
          onPress={() => router.push('/onboarding/screen3')}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '75%',
    resizeMode: 'contain',
  },
});
