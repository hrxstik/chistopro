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

  // (необязательно, но логично) если не получен — показываем скрытый
  const isVisible = acquired && cleaned;

  const icon = isVisible ? (
    <Image source={cleanChubrik} style={styles.cleanImage} />
  ) : (
    <HiddenIcon width={100} height={90} />
  );

  // цвета как у достижений: активный/неактивный
  const borderColor = acquired ? Colors.primary : Colors.disabled;
  const titleColor = acquired ? Colors.text : Colors.disabled;

  return (
    <View style={[styles.card, { borderColor }]}>
      <View style={styles.iconWrapper}>{icon}</View>

      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },

  iconWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    fontSize: 16,
    fontFamily: 'Nexa',
    fontWeight: '600',
  },
});

export default ChubrikTerrariumItem;
