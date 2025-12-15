// components/AchievementCard.tsx
import { Colors } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  description: string;
  current: number;
  target: number;
  icon: React.ReactNode;
};

export function AchievementCard({
  title,
  description,
  current,
  target,
  icon,
}: Props) {
  const progressRaw = target > 0 ? current / target : 0;
  const progress = Math.max(0, Math.min(1, progressRaw));
  const isCompleted = progress >= 1;

  const borderColor = isCompleted ? Colors.primary : Colors.disabled;
  const titleColor = isCompleted ? Colors.text : Colors.disabled;
  const descColor = isCompleted ? '#9BA4AF' : Colors.disabled;
  const barFillColor = isCompleted ? Colors.primary : Colors.disabled;

  return (
    <View style={[styles.card, { borderColor }]}>
      <View style={styles.iconWrapper}>{icon}</View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
          {title}
        </Text>
        <Text
          style={[styles.description, { color: descColor }]}
          numberOfLines={1}
        >
          {description}
        </Text>

        <View style={styles.progressOuter}>
          <View
            style={[
              styles.progressInner,
              { width: `${progress * 100}%`, backgroundColor: barFillColor },
            ]}
          />
          <View style={styles.progressLabelWrapper}>
            <Text style={styles.progressLabel}>
              {current}/{target}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center', // иконка вертикально по центру
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 41,
    height: 41,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,        // шрифт чуть больше
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,        // тоже немного больше
    marginBottom: 8,
  },
  progressOuter: {
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.disabled,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
    position: 'relative',
  },
  progressInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },
  progressLabelWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
