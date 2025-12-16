// app/stats/achievements.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import BrushFilled from '@/assets/icons/achievements/brush1.svg';
import BrushOutline from '@/assets/icons/achievements/brush2.svg';
import ClownFilled from '@/assets/icons/achievements/clown1.svg';
import ClownOutline from '@/assets/icons/achievements/clown2.svg';
import CrownFilled from '@/assets/icons/achievements/crown1.svg';
import CrownOutline from '@/assets/icons/achievements/crown2.svg';
import SpongeFilled from '@/assets/icons/achievements/sponge1.svg';
import SpongeOutline from '@/assets/icons/achievements/sponge2.svg';

import { AchievementCard } from '@/components/AchievementCard';
import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';

type Achievement = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  iconType: 'care' | 'streak' | 'collector' | 'offender';
};
// надо передавать в порядке выполнения - от нового к старому
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'care1',
    title: 'Ухажёр за чубриком I',
    description: 'Очистить чубрика до 2 уровня',
    current: 2,
    target: 2,
    iconType: 'care',
  },
  {
    id: 'streak1',
    title: 'Упорный I',
    description: 'Выполнить 7 чек-листов подряд',
    current: 7,
    target: 7,
    iconType: 'streak',
  },
  {
    id: 'care2',
    title: 'Ухажёр за чубриком II',
    description: 'Очистить чубрика до 3 уровня',
    current: 3,
    target: 3,
    iconType: 'care',
  },
  {
    id: 'care3',
    title: 'Ухажёр за чубриком III',
    description: 'Очистить чубрика до 4 уровня',
    current: 3,
    target: 4,
    iconType: 'care',
  },
  {
    id: 'streak2',
    title: 'Упорный II',
    description: 'Выполнить 28 чек-листов подряд',
    current: 15,
    target: 28,
    iconType: 'streak',
  },
  {
    id: 'streak3',
    title: 'Упорный III',
    description: 'Выполнить 90 чек-листов подряд',
    current: 15,
    target: 90,
    iconType: 'streak',
  },
  {
    id: 'collector1',
    title: 'Коллекционер чубриков I',
    description: 'Очистить своего 1 чубрика',
    current: 0,
    target: 1,
    iconType: 'collector',
  },
  {
    id: 'collector2',
    title: 'Коллекционер чубриков II',
    description: 'Очистить 3 чубрика',
    current: 0,
    target: 3,
    iconType: 'collector',
  },
  {
    id: 'collector3',
    title: 'Коллекционер чубриков III',
    description: 'Очистить 5 чубриков',
    current: 0,
    target: 5,
    iconType: 'collector',
  },
  {
    id: 'offender1',
    title: 'Обидчик чубриков I',
    description: 'Заставить уйти 10 чубриков',
    current: 0,
    target: 10,
    iconType: 'offender',
  },
  {
    id: 'offender2',
    title: 'Обидчик чубриков II',
    description: 'Заставить уйти 20 чубриков',
    current: 0,
    target: 20,
    iconType: 'offender',
  },
  {
    id: 'offender3',
    title: 'Обидчик чубриков III',
    description: 'Заставить уйти 30 чубриков',
    current: 0,
    target: 30,
    iconType: 'offender',
  },
];

function renderIcon(iconType: Achievement['iconType'], isCompleted: boolean) {
  const sizeProps = { width: 41, height: 41 };

  switch (iconType) {
    case 'care':
      return isCompleted ? <SpongeFilled {...sizeProps} /> : <SpongeOutline {...sizeProps} />;
    case 'streak':
      return isCompleted ? <BrushFilled {...sizeProps} /> : <BrushOutline {...sizeProps} />;
    case 'collector':
      return isCompleted ? <CrownFilled {...sizeProps} /> : <CrownOutline {...sizeProps} />;
    case 'offender':
    default:
      return isCompleted ? <ClownFilled {...sizeProps} /> : <ClownOutline {...sizeProps} />;
  }
}

export default function AchievementsScreen() {
  const router = useRouter();
  const sorted = React.useMemo(() => {
    const completed = ACHIEVEMENTS.filter(a => a.current >= a.target);
    const notCompleted = ACHIEVEMENTS.filter(a => a.current < a.target);
    return [...completed, ...notCompleted];
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <BackButton />
          <Text style={styles.headerTitle}>Достижения</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>

      <View style={styles.topDivider} />

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isCompleted = item.current >= item.target;
          return (
            <AchievementCard
              title={item.title}
              description={item.description}
              current={item.current}
              target={item.target}
              icon={renderIcon(item.iconType, isCompleted)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 40, paddingHorizontal: 16, paddingBottom: 0 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 20, fontFamily: 'Nexa' },
  topDivider: { height: 2, backgroundColor: Colors.primary },
  listContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
});
