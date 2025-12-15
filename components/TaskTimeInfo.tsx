// components/TaskTimeInfo.tsx
import { Colors } from '@/constants/colors';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  minutes: number;
};

export function TaskTimeInfo({ minutes }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.text}>{minutes} мин</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch', // чтобы divider мог растянуться по высоте строки
    marginLeft: 8,
  },
  divider: {
    width: 1.5,
    backgroundColor: Colors.primary,
    alignSelf: 'stretch', // от верха до низа родителя
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
