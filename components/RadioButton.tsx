// RadioButton.tsx
import { Colors } from '@/constants/colors';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  borderColor?: string;
};

export function RadioButton({ label, selected, onPress, borderColor = Colors.primary }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { borderColor },
        selected && styles.selected,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderWidth: 1.5,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  selected: {
    borderWidth: 4,
  },
  text: {
    fontSize: 16,
    color: Colors.text,
  },
});