import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BackButton } from '@/components/BackButton';
import { TaskTimeInfo } from '@/components/TaskTimeInfo';
import { Colors } from '@/constants/colors';
import { checklistStorage } from '@/utils/checklistStorage';
import { ChecklistTask, TaskStatus } from '@/types/checklist';
import { formatDate } from '@/utils/checklistGenerator';
import { getTodayDateString } from '@/utils/checklistGenerator';

import CrossIcon from '@/assets/icons/cross.svg';
import GrayTickIcon from '@/assets/icons/graytick.svg';
import LoadingIcon from '@/assets/icons/loading.svg';

type HistoryTask = {
  id: string;
  title: string;
  date: string;
  status: TaskStatus;
};

function getStatusIcon(status: TaskStatus) {
  if (status === 'in_progress') {
    return <LoadingIcon width={18} height={18} />;
  }
  if (status === 'done') {
    return <GrayTickIcon width={18} height={18} />;
  }
  return <CrossIcon width={18} height={18} />;
}

function getStatusColor(status: TaskStatus) {
  if (status === 'in_progress') return Colors.primary;   // голубой
  if (status === 'done') return Colors.disabled;         // серый
  return Colors.red;                                     // красный
}

export default function ReceivedTasksScreen() {
  const router = useRouter();
  const [allTasks, setAllTasks] = useState<HistoryTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      // Статистика учитывает ВСЕ чеклисты (и до пропуска, и после)
      const checklists = await checklistStorage.getChecklists();
      const today = getTodayDateString();
      
      // Собираем все задачи из всех чеклистов
      const tasks: HistoryTask[] = [];
      
      for (const checklist of checklists) {
        const formattedDate = formatDate(checklist.date);
        
        for (const task of checklist.tasks) {
          // Для текущего дня задачи могут быть "in_progress", для старых - только "done" или "missed"
          let status: TaskStatus = task.status;
          if (checklist.date < today && task.status === 'in_progress') {
            status = 'missed';
          }
          
          tasks.push({
            id: `${checklist.id}-${task.id}`,
            title: task.title,
            date: formattedDate,
            status,
          });
        }
      }
      
      // Сортируем по дате (новые первыми)
      tasks.sort((a, b) => {
        const dateA = new Date(a.date.split('.').reverse().join('-')).getTime();
        const dateB = new Date(b.date.split('.').reverse().join('-')).getTime();
        return dateB - dateA;
      });
      
      setAllTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const completedCount = allTasks.filter((t) => t.status === 'done').length;
  const missedCount = allTasks.filter((t) => t.status === 'missed').length;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* шапка */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <BackButton />
          <Text style={styles.headerTitle}>Полученные задачи</Text>
          <View style={{ width: 32 }} />
        </View>
       
      </View>
 <View style={styles.topDivider} />
      {/* счётчики */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Всего выполнено задач: {completedCount}
        </Text>
        <Text style={styles.summaryText}>
          Всего пропущено задач: {missedCount}
        </Text>
      </View>

      {/* список задач */}
      <FlatList
        data={allTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const color = getStatusColor(item.status);
          return (
            <View
              style={[
                styles.taskRow,
                { borderColor: color }, // цвет рамки по статусу
              ]}
            >
              <View style={styles.iconWrapper}>{getStatusIcon(item.status)}</View>

              <View style={styles.taskMain}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.status === 'in_progress' && { color },
                    item.status === 'done' && { color },
                    item.status === 'missed' && { color },
                  ]}
                >
                  {item.title}
                </Text>
              </View>

              <TaskTimeInfo text={item.date} color={color} />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 0,
    backgroundColor: Colors.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nexa',
  },
  topDivider: {
    height: 2,
    backgroundColor: Colors.primary,
    width: '100%',
  },

  summary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: 'Nexa',
    marginBottom: 4,
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  taskMain: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
    flexShrink: 1,
  },
});
