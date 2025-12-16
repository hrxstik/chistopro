import { Colors } from '@/constants/colors';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
};

export function OnboardingCloud({ text }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/cloud.png')}
        style={styles.cloud}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 280,
  },
  cloud: {
    width: 276,
    height: 177,
    resizeMode: 'contain',
  },
  text: {
    fontFamily: 'Nexa',
    position: 'absolute',
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 22,
  },
});
