import { OnboardingButton } from '@/components/OnboardingButton';
import { OnboardingCloud } from '@/components/OnboardingCloud';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useRouter } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

export default function Screen2() {
  const router = useRouter();

  return (
    <OnboardingLayout
      top={
        <OnboardingCloud
          text={'Заполни небольшую\nанкету и мы\nприступим к уборке!'}
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
          onPress={() => router.push('/questionnaire/step1')}
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