import BackArrow from '@/assets/icons/backarrow.svg';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

export function BackButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <BackArrow width={20} height={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
