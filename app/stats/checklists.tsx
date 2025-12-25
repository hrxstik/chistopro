import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useChecklistsStats } from '@/hooks/useChecklistsStats';
import { useProfile } from '@/hooks/useProfile';
import { ChecklistStatus } from '@/types/checklist';
import { formatDate, generateChecklist, getTodayDateString } from '@/utils/checklistGenerator';
import { checklistStorage } from '@/utils/checklistStorage';
import { storage } from '@/utils/storage';
import { taskHistory } from '@/utils/taskHistory';

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
  const { profile, loadProfile } = useProfile();
  const [clearing, setClearing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const handleClearStats = () => {
    Alert.alert(
      'Очистить статистику',
      'Вы уверены, что хотите удалить всю статистику? Это действие нельзя отменить.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);

              // 1. Очищаем все чеклисты
              await checklistStorage.clearChecklists();

              // 2. Очищаем всю историю задач (включая историю по комнатам и цикл стирки)
              try {
                await taskHistory.clearAllHistory();
              } catch (error) {
                console.warn('Error clearing task history (may already be empty):', error);
              }

              // 3. Сбрасываем прогресс чубрика, устанавливаем чубрика с ID 1, очищаем достижения и террариум
              if (profile) {
                await storage.saveProfile({
                  ...profile,
                  chubrikProgress: 0, // Сбрасываем текущий прогресс чубрика (0/4)
                  chubrikMaxLevel: 1, // Сбрасываем максимальный уровень (очищает достижения)
                  chubriks: 0, // Устанавливаем чубрика с ID 1 (currentChubrikId = 0 + 1 = 1) и очищаем террариум
                });
                await loadProfile();
              }

              // 4. Обновляем прогресс чубрика (обновит ползунок и картинку на главном экране)
              try {
                const { updateChubrikProgress } = await import('@/hooks/useChubrikProgress');
                await updateChubrikProgress();
              } catch (error) {
                console.error('Error updating chubrik progress:', error);
              }

              // Перезагружаем статистику
              await reload();

              Alert.alert(
                'Готово',
                'Статистика успешно очищена:\n• Все чеклисты\n• История задач\n• Прогресс чубрика\n• Чубрик установлен на ID 1\n• Достижения\n• Террариум',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Переходим на главный экран, где автоматически сгенерируется новый чеклист
                      router.push('/tabs');
                    },
                  },
                ],
              );
            } catch (error) {
              console.error('Error clearing stats:', error);
              Alert.alert('Ошибка', 'Не удалось очистить статистику');
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

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

        {/* Кнопка очистки статистики */}
        <Pressable
          style={[styles.clearButton, clearing && styles.clearButtonDisabled]}
          onPress={handleClearStats}
          disabled={clearing}>
          <Text style={styles.clearButtonText}>
            {clearing ? 'Очистка...' : 'Очистить всю статистику'}
          </Text>
        </Pressable>
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

  clearButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.red,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Nexa',
    fontWeight: '600',
  },
});
