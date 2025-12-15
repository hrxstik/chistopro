// app/(tabs)/index.tsx
import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GiftIcon from '@/assets/icons/gift.svg';
import { AdBanner } from '@/components/AdBanner';
import { Checkbox } from '@/components/Checkbox';
import { TaskTimeInfo } from '@/components/TaskTimeInfo';
import { Colors } from '@/constants/colors';

type Task = {
  id: string;
  title: string;
  time: string;
  completed: boolean;
};

const TOTAL_DAYS = 28;
const COMPLETED_DAYS = 15; // меняешь это число — меняется уровень/прогресс

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Почистить раковину в ванной',
    time: '4 мин',
    completed: false,
  },
  {
    id: '2',
    title: 'Протереть дверные ручки и выключатели',
    time: '3 мин',
    completed: false,
  },
  {
    id: '3',
    title: 'Помыть пол в гостиной',
    time: '7 мин',
    completed: false,
  },
  {
    id: '4',
    title: 'Протереть стол на кухне',
    time: '2 мин',
    completed: false,
  },
];

function getMascotSource(day: number) {
  if (day <= 7) {
    return require('@/assets/images/chubrik1_dirty1.png');
  }
  if (day <= 14) {
    return require('@/assets/images/chubrik1_dirty2.png');
  }
  if (day <= 21) {
    return require('@/assets/images/chubrik1_dirty3.png');
  }
  return require('@/assets/images/chubrik1_clean.png');
}

// 5 фаз / уровней
function getLevel(day: number) {
  if (day <= 7) return 1;      // 0–7
  if (day <= 14) return 2;     // 8–14
  if (day <= 21) return 3;     // 15–21
  if (day <= 27) return 4;     // 22–27
  return 5;                    // 28+ подарок
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const completedDays = COMPLETED_DAYS;
  const progress = Math.max(0, Math.min(1, completedDays / TOTAL_DAYS));
  const level = getLevel(completedDays);
  const mascotSource = getMascotSource(completedDays);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* верхняя голубая линия */}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Реклама чуть ниже синей линии */}
            <AdBanner />

            <View style={styles.headerBlock}>
              <Text style={styles.mascotTitle}>Чубрик обыкновенный</Text>
              <Text style={styles.levelText}>{level} уровень</Text>

              <Image source={mascotSource} style={styles.mascot} />

              {/* шкала прогресса */}
              <View style={styles.progressWrapper}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                  <View style={styles.progressLabelWrapper}>
                    <Text style={styles.progressLabel}>
                      {completedDays}/{TOTAL_DAYS}
                    </Text>
                  </View>
                </View>

                {/* 5 фаз: 1 2 3 4 и 🎁 с палочками */}
                <View style={styles.phasesWrapper}>
                  <View style={styles.phaseItem}>
                    <View style={styles.phaseTick} />
                    <Text style={styles.phaseNumber}>1</Text>
                  </View>
                  <View style={styles.phaseItem}>
                    <View style={styles.phaseTick} />
                    <Text style={styles.phaseNumber}>2</Text>
                  </View>
                  <View style={styles.phaseItem}>
                    <View style={styles.phaseTick} />
                    <Text style={styles.phaseNumber}>3</Text>
                  </View>
                  <View style={styles.phaseItem}>
                    <View style={styles.phaseTick} />
                    <Text style={styles.phaseNumber}>4</Text>
                  </View>
                  <View style={styles.phaseItem}>
                    <View style={styles.phaseTick} />
                    <GiftIcon width={20} height={20} />
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.tasksTitle}>Задачи на сегодня:</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <View style={styles.taskLeft}>
              <Checkbox
                checked={item.completed}
                onToggle={() => toggleTask(item.id)}
              />
              <Text
                style={[
                  styles.taskTitle,
                  item.completed && styles.taskTitleCompleted,
                ]}
              >
                {item.title}
              </Text>
            </View>

            <TaskTimeInfo text={item.time} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topDivider: {
    height: 2,
    backgroundColor: Colors.primary,
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mascotTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  levelText: {
    fontSize: 14,
    marginBottom: 12,
  },
  mascot: {
    width: 140,
    height: 200,
    marginBottom: 16,
    resizeMode: 'contain',
  },

  // прогресс-бар
  progressWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  progressFill: {
    height: 24,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  progressLabelWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },

  // фазы/деления
  phasesWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  phaseItem: {
    alignItems: 'center',
  },
  phaseTick: {
    width: 1.5,
    height: 10,
    backgroundColor: Colors.primary,
    marginBottom: 4,
  },
  phaseNumber: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // задачи
  tasksTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'stretch',   // важно для высоты палки
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTitle: {
    fontSize: 14,
    flexShrink: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.primary,
  },

});
