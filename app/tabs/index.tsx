// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useChecklist } from '@/hooks/useChecklist';
import { useProfile } from '@/hooks/useProfile';
import { useChubrikProgress } from '@/hooks/useChubrikProgress';
import { checklistStorage } from '@/utils/checklistStorage';

const TOTAL_DAYS = 28;

function getMascotSource(progress: number) {
  if (progress <= 6) {
    return require('@/assets/images/chubrik1_dirty1.png');
  }
  if (progress <= 13) {
    return require('@/assets/images/chubrik1_dirty2.png');
  }
  if (progress <= 20) {
    return require('@/assets/images/chubrik1_dirty3.png');
  }
  return require('@/assets/images/chubrik1_clean.png');
}

// Уровни чубрика на основе прогресса
function getLevelText(progress: number, level: number): string {
  if (progress >= 28) {
    return "Привычка сформирована";
  }
  return `${level} уровень`;
}

export default function HomeScreen() {
  const { profile } = useProfile();
  const rooms = profile?.rooms || [];
  const { currentChecklist, loading, toggleTask } = useChecklist(rooms);
  const { progress: chubrikProgress, currentLevel, loading: progressLoading, reload: reloadProgress } = useChubrikProgress();

  // Обновляем прогресс при изменении чеклиста
  useEffect(() => {
    if (currentChecklist) {
      reloadProgress();
    }
  }, [currentChecklist, reloadProgress]);

  const progress = Math.max(0, Math.min(1, chubrikProgress / TOTAL_DAYS));
  const level = getLevelText(chubrikProgress, currentLevel);
  const mascotSource = getMascotSource(chubrikProgress);

  if (loading || progressLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tasks = currentChecklist?.tasks || [];

  return (
    <View style={styles.container}>
      {/* верхняя голубая линия */}
<AdBanner />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Реклама чуть ниже синей линии */}
            
            <View style={styles.headerBlock}>
              <Text style={styles.mascotTitle}>Чубрик обыкновенный</Text>
              <Text style={styles.levelText}>{level}</Text>

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
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <View style={styles.taskLeft}>
              <Checkbox
                checked={item.status === 'done'}
                onToggle={() => toggleTask(item.id)}
              />
              <Text
                style={[
                  styles.taskTitle,
                  item.status === 'done' && styles.taskTitleCompleted,
                ]}
              >
                {item.title}
              </Text>
            </View>

            <TaskTimeInfo text={`${item.minutes} мин`} />
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

});
