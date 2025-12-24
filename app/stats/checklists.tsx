import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import CrossIcon from '@/assets/icons/cross.svg';
import GrayTickIcon from '@/assets/icons/graytick.svg';
import LoadingIcon from '@/assets/icons/loading.svg';
import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';
import { useChecklistsStats } from '@/hooks/useChecklistsStats';
import { ChecklistStatus } from '@/types/checklist';
import { formatDate } from '@/utils/checklistGenerator';

function getStatusIcon(status: ChecklistStatus) {
  if (status === 'in_progress') return <LoadingIcon width={18} height={18} />;
  if (status === 'done') return <GrayTickIcon width={18} height={18} />;
  return <CrossIcon width={18} height={18} />;
}

function getStatusColor(status: ChecklistStatus) {
  if (status === 'in_progress') return Colors.primary; // голубой
  if (status === 'done') return Colors.disabled; // серый
  return Colors.red; // красный
}

export default function ChecklistsScreen() {
  const router = useRouter();
  const { checklists, loading, totalClosed, recordStreak, reload } = useChecklistsStats();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

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
          <Text style={styles.headerTitle}>Чек-листы</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>
      <View style={styles.topDivider} />
      {/* итоги */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Всего закрыто чек-листов: {totalClosed}</Text>
        <Text style={styles.summaryText}>Рекорд закрытых подряд: {recordStreak}</Text>
      </View>

      <FlatList
        data={checklists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const color = getStatusColor(item.status);
          const formattedDate = formatDate(item.date);
          return (
            <Pressable
              style={[styles.row, { borderColor: color }]}
              onPress={() =>
                router.push({
                  pathname: '/stats/checklist-details',
                  params: { date: item.date, checklistId: item.id },
                })
              }>
              <View style={styles.statusIcon}>{getStatusIcon(item.status)}</View>
              <Text style={[styles.dateText, { color }]}>{formattedDate}</Text>
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
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
  },
});
