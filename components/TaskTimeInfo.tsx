import { Colors } from '@/constants/colors';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;         
  color?: string;      
};

export function TaskTimeInfo({ text, color = Colors.primary }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.divider, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginLeft: 8,
  },
  divider: {
    width: 1.5,
    alignSelf: 'stretch',
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
