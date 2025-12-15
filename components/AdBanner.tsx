// components/AdBanner.tsx
import { Colors } from '@/constants/colors';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  text?: string;
};

export function AdBanner({ text = 'Реклама' }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.banner}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: 30,          // реклама ещё пониже от верхней линии
    marginBottom: 16,
  },
  banner: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: Colors.text,
  },
});
