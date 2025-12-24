import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { Checklist, TaskStatus } from '@/types/checklist';
import { formatDate } from '@/utils/checklistGenerator';

import CrossIcon from '@/assets/icons/cross.svg';
import GrayTickIcon from '@/assets/icons/graytick.svg';
import LoadingIcon from '@/assets/icons/loading.svg';

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
  const { date, checklistId } = useLocalSearchParams<{ date?: string; checklistId?: string }>();
  const router = useRouter();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
  }, [date, checklistId]);

  useFocusEffect(
    useCallback(() => {
      loadChecklist();
    }, [date, checklistId])
  );

  const loadChecklist = async () => {
    try {
      if (checklistId) {
        const checklists = await checklistStorage.getChecklists();
        const found = checklists.find(c => c.id === checklistId);
        setChecklist(found || null);
      } else if (date) {
        const found = await checklistStorage.getChecklistByDate(date);
        setChecklist(found);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const titleDate = date ? formatDate(date) : '--.--.--';

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!checklist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <BackButton />
            <Text style={styles.headerTitle}>Чек-лист</Text>
            <View style={{ width: 32 }} />
          </View>
        </View>
        <View style={styles.topDivider} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontFamily: 'Nexa-Reg', color: Colors.primary }}>
            Чек-лист не найден
          </Text>
        </View>
      </View>
    );
  }

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
        data={checklist.tasks}
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
    fontSize: 20,
    fontFamily: 'Nexa',
  },
  headerTitleBold: {
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
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
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
