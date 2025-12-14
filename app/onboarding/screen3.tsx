import { useRouter } from 'expo-router';

import { OnboardingButton } from '@/components/OnboardingButton';
import { OnboardingCloud } from '@/components/OnboardingCloud';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { OnboardingMascot } from '@/components/OnboardingMascot';

export default function Screen2() {
  const router = useRouter();

  return (
    <OnboardingLayout
      top={
        <OnboardingCloud
          text={'Заполни небольшую анкету\nи мы приступим к уборке!'}
        />
      }
      center={<OnboardingMascot variant="dirty" />}
      bottom={
        <OnboardingButton
          title="Продолжить"
          onPress={() => router.push('/questionnaire/step1')}
        />
      }
    />
  );
}
