import { Colors } from '@/constants/colors';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// скрытый чубрик
import HiddenIcon from '@/assets/icons/chubrik_hidden.svg';

// пока один общий "чистый" чубрик
const cleanChubrik = require('@/assets/images/chubrik1_clean.png');

type Props = {
  name: string;
  acquired: boolean;
  cleaned: boolean;
};

export function ChubrikTerrariumItem({ name, acquired, cleaned }: Props) {
  const title = acquired ? name : 'Неизвестно';

  const icon = cleaned ? (
    <Image source={cleanChubrik} style={styles.cleanImage} />
  ) : (
    <HiddenIcon width={100} height={90} />
  );

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>{icon}</View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },

  iconWrapper: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  cleanImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },

  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default ChubrikTerrariumItem;
