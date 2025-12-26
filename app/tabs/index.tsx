// app/(tabs)/index.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';

import GiftIcon from '@/assets/icons/gift.svg';
import { AdBanner } from '@/components/AdBanner';
import { Checkbox } from '@/components/Checkbox';
import { TaskTimeInfo } from '@/components/TaskTimeInfo';
import { Colors } from '@/constants/colors';
import { useChecklist } from '@/hooks/useChecklist';
import { TOTAL_DAYS, useChubrikProgress } from '@/hooks/useChubrikProgress';
import { useProfile } from '@/hooks/useProfile';

// Список имен чубриков
const CHUBRIK_NAMES: Record<string, string> = {
  '1': 'Чубрик обычный',
  '2': 'Чубрик-енот',
};

// Функция для получения изображения чубрика на основе ID и прогресса
function getMascotSource(chubrikId: string, progress: number) {
  // Определяем стадию роста:
  // dirty1: 0-2 чеклиста
  // dirty2: 3-4 чеклиста
  // dirty3: 5-6 чеклистов
  // чистый: 7-8 чеклистов
  let stage = 1;
  if (progress <= 2) stage = 1; // dirty1 - самый грязный (0-2)
  else if (progress <= 4) stage = 2; // dirty2 - средний (3-4)
  else if (progress <= 6) stage = 3; // dirty3 - самый чистый (5-6)
  else stage = 4; // Чистый (progress >= 7, т.е. 7-8)

  // Выбираем изображение в зависимости от ID чубрика и стадии
  if (stage === 4) {
    // Чистый чубрик
    switch (chubrikId) {
      case '1':
        return require('@/assets/images/chubrik1_clean.png');
      case '2':
        return require('@/assets/images/chubrik2_clean.png');
      default:
        return require('@/assets/images/chubrik1_clean.png');
    }
  } else {
    // Грязный чубрик
    switch (chubrikId) {
      case '1':
        if (stage === 1) return require('@/assets/images/chubrik1_dirty1.png');
        if (stage === 2) return require('@/assets/images/chubrik1_dirty2.png');
        return require('@/assets/images/chubrik1_dirty3.png');
      case '2':
        if (stage === 1) return require('@/assets/images/chubrik2_dirty1.png');
        if (stage === 2) return require('@/assets/images/chubrik2_dirty2.png');
        return require('@/assets/images/chubrik2_dirty3.png');
      default:
        if (stage === 1) return require('@/assets/images/chubrik1_dirty1.png');
        if (stage === 2) return require('@/assets/images/chubrik1_dirty2.png');
        return require('@/assets/images/chubrik1_dirty3.png');
    }
  }
}

// Функция для получения имени текущего чубрика
function getChubrikName(chubrikId: string): string {
  return CHUBRIK_NAMES[chubrikId] || 'Чубрик обычный';
}

// Уровни чубрика на основе прогресса
function getLevelText(progress: number, level: number): string {
  if (progress >= TOTAL_DAYS) {
    return 'Привычка сформирована';
  }
  return `${level} уровень`;
}

export default function HomeScreen() {
  const { profile, loadProfile } = useProfile();
  const rooms = profile?.rooms || [];
  const { currentChecklist, loading, toggleTask, reloadChecklist } = useChecklist(rooms);
  const {
    progress: chubrikProgress,
    currentLevel,
    loading: progressLoading,
    reload: reloadProgress,
  } = useChubrikProgress();

  // Обновляем данные при фокусе на экране (например, после очистки статистики)
  useFocusEffect(
    useCallback(() => {
      // 1. Получаем профиль
      loadProfile();
      // 2. Проверяем есть ли чеклист, генерируем если нет (внутри useChecklist)
      reloadChecklist();
      // 3. Обновляем прогресс чубрика на основе профиля
      reloadProgress();
    }, []),
  );

  // Обновляем прогресс при изменении чеклиста (включая после выполнения)
  // Но НЕ вызываем updateChubrikProgress здесь - он вызывается в useChecklist когда чеклист завершен
  // Здесь только обновляем отображение если статус изменился
  useEffect(() => {
    if (currentChecklist) {
      // Обновляем профиль для отображения актуальных данных
      loadProfile();
      // Перезагружаем прогресс для отображения (но не обновляем сам прогресс - это делается в useChecklist)
      reloadProgress();
    }
  }, [currentChecklist?.status]);

  // Определяем текущий ID чубрика (количество выращенных + 1) из профиля
  const currentChubrikId = profile ? String((profile.chubriks || 0) + 1) : '1';
  const chubrikName = getChubrikName(currentChubrikId);

  // Определяем прогресс и стадию из хука (синхронизировано с профилем)
  const progressValue = chubrikProgress; // Используем значение из хука, которое обновляется автоматически
  const progress = Math.max(0, Math.min(1, progressValue / TOTAL_DAYS));
  const level = getLevelText(progressValue, currentLevel);
  const mascotSource = getMascotSource(currentChubrikId, progressValue);

  if (loading || progressLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tasks = currentChecklist?.tasks || [];

  // Группируем задачи по участникам
  type TaskGroup = {
    assignedTo: string | null;
    name: string;
    tasks: typeof tasks;
  };

  const groupedTasks: TaskGroup[] = [];
  const tasksByParticipant = new Map<string | null, typeof tasks>();

  // Группируем задачи по assignedTo
  tasks.forEach((task) => {
    const key = task.assignedTo ?? null;
    if (!tasksByParticipant.has(key)) {
      tasksByParticipant.set(key, []);
    }
    tasksByParticipant.get(key)!.push(task);
  });

  // Создаем группы с именами участников
  // Сначала пользователь (null)
  if (tasksByParticipant.has(null)) {
    groupedTasks.push({
      assignedTo: null,
      name: 'Ваши задачи',
      tasks: tasksByParticipant.get(null)!,
    });
  }

  // Затем сожители (взрослые старше 10 лет)
  const householdMembers = profile?.householdMembers || [];
  householdMembers.forEach((member) => {
    const age = parseInt(member.age) || 0;
    if (age > 10 && tasksByParticipant.has(member.id)) {
      groupedTasks.push({
        assignedTo: member.id,
        name: `Задачи домочадца ${member.name}`,
        tasks: tasksByParticipant.get(member.id)!,
      });
    }
  });

  // Затем дети от 3 до 10 лет (если у них есть задачи)
  householdMembers.forEach((member) => {
    const age = parseInt(member.age) || 0;
    if (age >= 3 && age <= 10 && tasksByParticipant.has(member.id)) {
      groupedTasks.push({
        assignedTo: member.id,
        name: `Задачи ${member.name}`,
        tasks: tasksByParticipant.get(member.id)!,
      });
    }
  });

  // Если нет группировки (старые чеклисты без assignedTo), показываем все задачи как "Ваши задачи"
  if (groupedTasks.length === 0 && tasks.length > 0) {
    groupedTasks.push({
      assignedTo: null,
      name: 'Ваши задачи',
      tasks: tasks,
    });
  }

  // Создаем плоский список элементов для отображения (заголовки + задачи)
  type ListItem = { type: 'header'; name: string } | { type: 'task'; task: (typeof tasks)[0] };
  const listItems: ListItem[] = [];

  groupedTasks.forEach((group, groupIndex) => {
    // Добавляем заголовок группы
    listItems.push({ type: 'header', name: group.name });

    // Добавляем задачи группы
    group.tasks.forEach((task) => {
      listItems.push({ type: 'task', task });
    });

    // Добавляем разделитель между группами (кроме последней)
    if (groupIndex < groupedTasks.length - 1) {
      listItems.push({ type: 'header', name: '---' });
    }
  });

  return (
    <View style={styles.container}>
      {/* верхняя голубая линия */}
      <AdBanner />

      <FlatList
        data={listItems}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `header-${item.name}-${index}` : item.task.id
        }
        ListHeaderComponent={
          <>
            {/* Реклама чуть ниже синей линии */}

            <View style={styles.headerBlock}>
              <Text style={styles.mascotTitle}>{chubrikName}</Text>
              <Text style={styles.levelText}>{level}</Text>

              <Image source={mascotSource} style={styles.mascot} />

              {/* шкала прогресса */}
              <View style={styles.progressWrapper}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  <View style={styles.progressLabelWrapper}>
                    <Text style={styles.progressLabel}>
                      {chubrikProgress}/{TOTAL_DAYS}
                    </Text>
                  </View>
                </View>

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
            {tasks.length === 0 && (
              <Text style={styles.emptyTasksText}>
                На сегодня задач нет. Проверьте настройки комнат в профиле.
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            if (item.name === '---') {
              // Разделитель
              return <View style={styles.divider} />;
            }
            // Заголовок группы
            return <Text style={styles.groupHeader}>{item.name}</Text>;
          }
          // Задача
          return (
            <View style={styles.taskRow}>
              <View style={styles.taskLeft}>
                <Checkbox
                  checked={item.task.status === 'done'}
                  onToggle={() => toggleTask(item.task.id)}
                />
                <Text
                  style={[
                    styles.taskTitle,
                    item.task.status === 'done' && styles.taskTitleCompleted,
                  ]}>
                  {item.task.title}
                </Text>
              </View>

              <TaskTimeInfo text={`${item.task.minutes} мин`} />
            </View>
          );
        }}
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
    fontFamily: 'Nexa',
    marginBottom: 4,
    textAlign: 'center',
  },
  levelText: {
    fontSize: 16,
    fontFamily: 'Nexa-Reg',
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
    fontSize: 14,
    fontFamily: 'Nexa',
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
    fontSize: 14,
    fontFamily: 'Nexa',
    color: Colors.primary,
  },

  // задачи
  tasksTitle: {
    fontSize: 18,
    fontFamily: 'Nexa',
    marginTop: 0,
    marginBottom: 8,
    textAlign: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'stretch', // важно для высоты палки
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
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
    flexShrink: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.primary,
  },
  emptyTasksText: {
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
    color: Colors.disabled,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  groupHeader: {
    fontSize: 16,
    fontFamily: 'Nexa',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary,
    marginVertical: 12,
    opacity: 0.3,
  },
});
