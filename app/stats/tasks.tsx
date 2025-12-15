import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BackButton } from '@/components/BackButton';
import { TaskTimeInfo } from '@/components/TaskTimeInfo';
import { Colors } from '@/constants/colors';

import CrossIcon from '@/assets/icons/cross.svg';
import GrayTickIcon from '@/assets/icons/graytick.svg';
import LoadingIcon from '@/assets/icons/loading.svg';

type TaskStatus = 'in_progress' | 'done' | 'overdue';

type HistoryTask = {
  id: string;
  title: string;
  date: string;
  status: TaskStatus;
};

const TASKS: HistoryTask[] = [
  {
    id: '1',
    title: 'Почистить раковину в ванной',
    date: '03.12.25',
    status: 'in_progress',
  },
  {
    id: '2',
    title: 'Протереть дверные ручки и выключатели',
    date: '03.12.25',
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'Помыть пол в гостиной',
    date: '03.12.25',
    status: 'done',
  },
  {
    id: '4',
    title: 'Протереть стол на кухне',
    date: '03.12.25',
    status: 'done',
  },
  {
    id: '5',
    title: 'Прибраться в шкафах в спальне',
    date: '02.12.25',
    status: 'done',
  },
  {
    id: '6',
    title: 'Помыть пол на кухне',
    date: '02.12.25',
    status: 'done',
  },
  {
    id: '7',
    title: 'Пропылесосить в гостиной',
    date: '02.12.25',
    status: 'overdue',
  },
];

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

  const completedCount = TASKS.filter((t) => t.status === 'done').length;
  const missedCount = TASKS.filter((t) => t.status === 'overdue').length;

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
        data={TASKS}
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
                    item.status === 'overdue' && { color },
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
    fontSize: 18,
    fontWeight: '700',
  },

  summary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  summaryText: {
    fontSize: 14,
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
    fontSize: 14,
    flexShrink: 1,
  },
});
