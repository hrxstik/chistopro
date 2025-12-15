import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CrossIcon from '@/assets/icons/cross.svg';
import GrayTickIcon from '@/assets/icons/graytick.svg';
import LoadingIcon from '@/assets/icons/loading.svg';
import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';

type ChecklistStatus = 'in_progress' | 'done' | 'missed';

type ChecklistItem = {
  id: string;
  date: string;
  status: ChecklistStatus;
};

const CHECKLISTS: ChecklistItem[] = [
  { id: '1', date: '03.12.25', status: 'in_progress' },
  { id: '2', date: '02.12.25', status: 'done' },
  { id: '3', date: '01.12.25', status: 'done' },
  { id: '4', date: '30.11.25', status: 'missed' },
  { id: '5', date: '29.11.25', status: 'done' },
  { id: '6', date: '28.11.25', status: 'done' },
];

function getStatusIcon(status: ChecklistStatus) {
  if (status === 'in_progress') return <LoadingIcon width={18} height={18} />;
  if (status === 'done') return <GrayTickIcon width={18} height={18} />;
  return <CrossIcon width={18} height={18} />;
}

function getStatusColor(status: ChecklistStatus) {
  if (status === 'in_progress') return Colors.primary;   // голубой
  if (status === 'done') return Colors.disabled;         // серый
  return Colors.red;                                     // красный
}

function calcRecordStreak(items: ChecklistItem[]): number {
  let best = 0;
  let current = 0;

  for (const item of items) {
    if (item.status === 'done') {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export default function ChecklistsScreen() {
  const router = useRouter();

  const totalClosed = CHECKLISTS.filter(
    (c) => c.status === 'done' || c.status === 'in_progress'
  ).length;

  const recordStreak = calcRecordStreak(CHECKLISTS);

  return (
    <View style={styles.container}>
      {/* шапка */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <BackButton />
          <Text style={styles.headerTitle}>Чек-листы</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>
<View style={styles.topDivider} />
      {/* итоги */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Всего закрыто чек-листов: {totalClosed}
        </Text>
        <Text style={styles.summaryText}>
          Рекорд закрытых подряд: {recordStreak}
        </Text>
      </View>

      <FlatList
        data={CHECKLISTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const color = getStatusColor(item.status);
          return (
            <Pressable
              style={[
                styles.row,
                { borderColor: color },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/stats/checklist-details',
                  params: { date: item.date },
                })
              }
            >
              <View style={styles.statusIcon}>{getStatusIcon(item.status)}</View>
              <Text style={[styles.dateText, { color }]}>{item.date}</Text>
            </Pressable>
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
    fontSize: 14,
    marginBottom: 4,
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  statusIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
  },
});
