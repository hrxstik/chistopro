import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { ChubrikTerrariumItem } from '@/components/ChubrikTerrariumItem';
import { Colors } from '@/constants/colors';
import { useChubrikProgress } from '@/hooks/useChubrikProgress';
import { useProfile } from '@/hooks/useProfile';

type Chubrik = {
  id: string;
  name: string;
  acquired: boolean;
  cleaned: boolean;
};

// Список всех доступных чубриков
const CHUBRIK_NAMES: Record<string, string> = {
  '1': 'Чубрик обычный',
  '2': 'Чубрик-енот',
};

export default function TerrariumScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { progress: currentProgress, loading: progressLoading } = useChubrikProgress();
  const [chubriks, setChubriks] = useState<Chubrik[]>([]);

  useEffect(() => {
    if (profile && !profileLoading && !progressLoading) {
      const cleanedCount = profile.chubriks || 0; // Количество полностью выращенных чубриков
      const currentChubrikId = cleanedCount + 1; // ID текущего выращиваемого чубрика

      // Формируем список всех чубриков
      const allChubriks: Chubrik[] = Object.keys(CHUBRIK_NAMES).map((id) => {
        const chubrikId = parseInt(id, 10);
        const cleaned = cleanedCount >= chubrikId; // Очищен, если количество выращенных >= id
        const acquired = cleaned || chubrikId === currentChubrikId; // Получен, если очищен или это текущий выращиваемый чубрик (даже с прогрессом 0/28)

        return {
          id,
          name: CHUBRIK_NAMES[id],
          acquired,
          cleaned,
        };
      });

      setChubriks(allChubriks);
    }
  }, [profile, currentProgress, profileLoading, progressLoading]);

  const totalAcquired = chubriks.filter((c) => c.acquired).length;

  if (profileLoading || progressLoading) {
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
          <Text style={styles.headerTitle}>Террариум чубриков</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>
      <View style={styles.topDivider} />

      {/* статистика */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Всего получено чубриков: {totalAcquired}</Text>
      </View>

      {/* список */}
      <FlatList
        data={chubriks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ChubrikTerrariumItem
            id={item.id}
            name={item.name}
            acquired={item.acquired}
            cleaned={item.cleaned}
            currentProgress={item.id === String((profile?.chubriks || 0) + 1) ? currentProgress : 0}
          />
        )}
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

  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 0,
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
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  separator: {
    width: '100%',
    height: 1.5,
    backgroundColor: Colors.primary,
  },
});
