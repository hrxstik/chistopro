import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BackButton } from '@/components/BackButton';
import { ChubrikTerrariumItem } from '@/components/ChubrikTerrariumItem';
import { Colors } from '@/constants/colors';

type Chubrik = {
  id: string;
  name: string;
  acquired: boolean;
  cleaned: boolean;
};

const CHUBRIKS: Chubrik[] = [
  { id: '1', name: 'Чубрик обычный', acquired: true, cleaned: true },
  { id: '2', name: 'Чубрик 2', acquired: true, cleaned: false },
  { id: '3', name: 'Чубрик 3', acquired: false, cleaned: false },
  { id: '4', name: 'Чубрик 4', acquired: false, cleaned: false },
  { id: '5', name: 'Чубрик 5', acquired: false, cleaned: false },
  { id: '6', name: 'Чубрик 6', acquired: false, cleaned: false },
  { id: '7', name: 'Чубрик 7', acquired: false, cleaned: false },
];

export default function TerrariumScreen() {
  const router = useRouter();

  const totalAcquired = CHUBRIKS.filter(c => c.acquired).length;

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
        <Text style={styles.summaryText}>
          Всего получено чубриков: {totalAcquired}
        </Text>
      </View>

      {/* список */}
      <FlatList
        data={CHUBRIKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ChubrikTerrariumItem
            name={item.name}
            acquired={item.acquired}
            cleaned={item.cleaned}
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
    paddingBottom: 40,
  },

  separator: {
    width: '100%',
    height: 1.5,
    backgroundColor: Colors.primary,
  },
});
