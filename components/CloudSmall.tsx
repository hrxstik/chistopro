import { Colors } from '@/constants/colors';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
  width?: number;
  height?: number;
};

export function CloudSmall({ text, width = 177, height = 115 }: Props) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={require('@/assets/images/cloud_S.png')}
        style={[styles.cloud, { width, height }]}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloud: {
    resizeMode: 'contain',
  },
  text: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 18,
  },
});
