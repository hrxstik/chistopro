import { Colors } from '@/constants/colors';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value?: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  min?: number;
  max?: number;
};

export function InputField({
  label,
  value,
  keyboardType,
  onChangeText,
  min,
  max,
}: Props) {
  const handleChange = (text: string) => {
    if (keyboardType !== 'numeric') {
      onChangeText(text);
      return;
    }

    // оставляем только цифры
    const digits = text.replace(/\D/g, '');
    if (digits === '') {
      onChangeText('');
      return;
    }

    let num = parseInt(digits, 10);

    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;

    onChangeText(String(num));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        keyboardType={keyboardType}
        onChangeText={handleChange}
        style={styles.input}
        placeholder=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.text,
  },
  input: {
    height: 44,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
