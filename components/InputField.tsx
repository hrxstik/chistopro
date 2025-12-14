import { Colors } from '@/constants/colors';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value?: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
};

export function InputField({ label, value, keyboardType, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.text,
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
