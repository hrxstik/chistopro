import { Colors } from '@/constants/colors';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// скрытый чубрик
import HiddenIcon from '@/assets/icons/chubrik_hidden.svg';

type Props = {
  id: string;
  name: string;
  acquired: boolean;
  cleaned: boolean;
  currentProgress: number;
};

// Функция для получения изображения чубрика
function getChubrikImage(id: string, cleaned: boolean, progress: number) {
  if (cleaned) {
    // Если очищен - показываем чистую версию
    switch (id) {
      case '1':
        return require('@/assets/images/chubrik1_clean.png');
      case '2':
        return require('@/assets/images/chubrik2_clean.png');
      default:
        return require('@/assets/images/chubrik1_clean.png');
    }
  } else if (progress > 0) {
    // Если выращивается - показываем грязную версию в зависимости от стадии
    // Распределение:
    // dirty1: 0-2 чеклиста
    // dirty2: 3-4 чеклиста
    // dirty3: 5-6 чеклистов
    // чистый: 7-8 чеклистов (обрабатывается выше в условии cleaned)
    let stage = 1;
    if (progress <= 2) stage = 1; // dirty1 - самый грязный (0-2)
    else if (progress <= 4) stage = 2; // dirty2 - средний (3-4)
    else stage = 3; // dirty3 - самый чистый (5-6)

    switch (id) {
      case '1':
        if (stage === 1) return require('@/assets/images/chubrik1_dirty1.png');
        if (stage === 2) return require('@/assets/images/chubrik1_dirty2.png');
        return require('@/assets/images/chubrik1_dirty3.png');
      case '2':
        if (stage === 1) return require('@/assets/images/chubrik2_dirty1.png');
        if (stage === 2) return require('@/assets/images/chubrik2_dirty2.png');
        return require('@/assets/images/chubrik2_dirty3.png');
      default:
        return require('@/assets/images/chubrik1_dirty1.png');
    }
  }
  // Если не получен - возвращаем null, будет показана скрытая иконка
  return null;
}

export function ChubrikTerrariumItem({ id, name, acquired, cleaned, currentProgress }: Props) {
  const title = acquired ? name : 'Неизвестно';

  // Определяем, какое изображение показывать
  const imageSource = useMemo(
    () => getChubrikImage(id, cleaned, currentProgress),
    [id, cleaned, currentProgress],
  );

  // Логика отображения:
  // 1. Если очищен (cleaned) - показываем чистую иконку
  // 2. Если получен но не очищен - показываем грязную иконку на последней стадии
  // 3. Если не получен - показываем скрытую иконку и "Неизвестно"
  const icon = imageSource ? (
    <Image source={imageSource} style={styles.cleanImage} />
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
