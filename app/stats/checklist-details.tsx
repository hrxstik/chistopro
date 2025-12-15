import { useLocalSearchParams } from 'expo-router';
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

type TaskStatus = 'in_progress' | 'done' | 'missed';

type ChecklistTask = {
  id: string;
  title: string;
  minutes: number;
  status: TaskStatus;
};

const DEMO_TASKS: ChecklistTask[] = [
  { id: '1', title: 'Почистить раковину в ванной',       minutes: 4, status: 'in_progress' },
  { id: '2', title: 'Протереть дверные ручки и выключатели', minutes: 3, status: 'in_progress' },
  { id: '3', title: 'Помыть пол в гостиной',              minutes: 7, status: 'done' },
  { id: '4', title: 'Протереть стол на кухне',            minutes: 2, status: 'missed' },
];

function getStatusIcon(status: TaskStatus) {
  if (status === 'in_progress') return <LoadingIcon width={18} height={18} />;
  if (status === 'done') return <GrayTickIcon width={18} height={18} />;
  return <CrossIcon width={18} height={18} />;
}

function getStatusColor(status: TaskStatus) {
  if (status === 'in_progress') return Colors.primary;   // голубой
  if (status === 'done') return Colors.disabled;         // серый
  return Colors.red;                                     // красный
}

export default function ChecklistDetailsScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const titleDate = date ?? '03.12.25';

  return (
    <View style={styles.container}>
      {/* шапка */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <BackButton />
          <Text style={styles.headerTitle}>
            Чек-лист за <Text style={styles.headerTitleBold}>{titleDate}</Text>
          </Text>
          <View style={{ width: 32 }} />
        </View>
      </View>
<View style={styles.topDivider} />
      <FlatList
        data={DEMO_TASKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const color = getStatusColor(item.status);
          return (
            <View
              style={[
                styles.row,
                { borderColor: color },
              ]}
            >
              <View style={styles.left}>
                <View style={styles.statusIcon}>{getStatusIcon(item.status)}</View>

                <Text
                  style={[
                    styles.taskTitle,
                    item.status === 'in_progress' && styles.taskInProgress,
                    item.status === 'done' && styles.taskDone,
                    item.status === 'missed' && styles.taskMissed,
                  ]}
                >
                  {item.title}
                </Text>
              </View>

              <TaskTimeInfo text={`${item.minutes} мин`} color={color} />
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
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitleBold: {
    fontWeight: '700',
  },
  topDivider: {
    height: 2,
    backgroundColor: Colors.primary,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    minHeight: 48,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 14,
    flexShrink: 1,
  },

  // цвета под статусы
  taskInProgress: {
    color: Colors.primary,
    textDecorationLine: 'none',
  },
  taskDone: {
    color: Colors.disabled,
    textDecorationLine: 'line-through',
  },
  taskMissed: {
    color: Colors.red,
    textDecorationLine: 'line-through',
  },
});
