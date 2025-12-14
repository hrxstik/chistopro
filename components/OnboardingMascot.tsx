// components/OnboardingMascot.tsx
import { Image, StyleSheet } from 'react-native';

type Props = {
  variant: 'clean' | 'dirty';
};

export function OnboardingMascot({ variant }: Props) {
  const source =
    variant === 'clean'
      ? require('@/assets/images/chubrik1_clean.png')
      : require('@/assets/images/chubrik1_dirty1.png');

  return <Image source={source} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
  },
});
