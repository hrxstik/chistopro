import { Colors } from '@/constants/colors';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
};

export function CloudSmall({ text }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/cloud_S.png')}
        style={styles.cloud}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 177,
    height: 115,
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloud: {
    width: 177,
    height: 115,

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
