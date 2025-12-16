import { Colors } from '@/constants/colors';
import { StyleSheet, View } from 'react-native';

type Props = {
  top: React.ReactNode;
  center: React.ReactNode;
  bottom: React.ReactNode;
};

export function OnboardingLayout({ top, center, bottom }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>{top}</View>
      <View style={styles.center}>{center}</View>
      <View style={styles.bottom}>{bottom}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: '20%',
    paddingBottom: '20%',
  },
  top: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    alignItems: 'center',
  },
});
