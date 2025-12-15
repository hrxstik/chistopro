import { AdBanner } from '@/components/AdBanner';
import { Colors } from '@/constants/colors';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// аватар
import ProfileIcon from '@/assets/icons/profile1.svg';

// иконки для статистики
import ChubrikHiddenIcon from '@/assets/icons/chubrik_hidden.svg';
import CupIcon from '@/assets/icons/cup.svg';
import GreenTick from '@/assets/icons/greentick.svg';
import MainIcon from '@/assets/icons/main.svg'; // 31x38 по макету

// картинка облака Premium
const premiumCloud = require('@/assets/images/premium.png');

// пока захардкоженные данные (потом заменишь на реальные)
const USER_NAME = 'Ирина';
const TASKS_DONE = 60;
const CHECKLIST_RECORD = 15;
const ACHIEVEMENTS = 1;
const CHUBRIKS = 0;

type StatCardProps = {
  icon: React.ReactNode;
  value: number;
  label: string;
};

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Pressable
      onPress={() => alert('Раздел в разработке')}
      style={({ pressed }) => [
        styles.statCard,
        pressed && styles.statCardPressed,
      ]}
    >
      <View style={styles.statIconWrapper}>{icon}</View>

      <View style={styles.statTextWrapper}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AdBanner/>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* аватар и имя */}
        <View style={styles.headerBlock}>
          <View style={styles.avatarCircle}>
            <ProfileIcon width={72} height={72} />
          </View>
          <Text style={styles.userName}>{USER_NAME}</Text>
        </View>

        {/* сетка статистики 2x2 */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<GreenTick width={38} height={38} />}
            value={TASKS_DONE}
            label={'выполнено\nзадач'}
          />
          <StatCard
            icon={<MainIcon width={38} height={38} />}
            value={CHECKLIST_RECORD}
            label={'рекорда закрытых\nчек-листов'}
          />
          <StatCard
            icon={<CupIcon width={38} height={38} />}
            value={ACHIEVEMENTS}
            label={'достижений\nполучено'}
          />
          <StatCard
            icon={<ChubrikHiddenIcon width={38} height={38} />}
            value={CHUBRIKS}
            label={'чубриков\nполучено'}
          />
        </View>

        {/* Premium облако */}
        <View style={styles.premiumWrapper}>
          <Image source={premiumCloud} style={styles.premiumImage} />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // аватар + имя
  headerBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },

  // сетка статистики
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 32,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardPressed: {
    opacity: 0.7,
  },
  statIconWrapper: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 0,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },

  // Premium
  premiumWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  premiumImage: {
    width: 220,
    height: 100,
    resizeMode: 'contain',
  },
  premiumText: {
    position: 'absolute',
    top: 35,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
});
