import { useEffect, useState } from 'react';
import { checklistStorage } from '@/utils/checklistStorage';
import { Checklist } from '@/types/checklist';

export type AchievementMetrics = {
  cleanedChubriks: number; // количество полностью выращенных чубриков (28/28)
  currentStreak: number; // текущая серия успешных чеклистов подряд
  bestStreak: number; // лучшая серия успешных чеклистов подряд
  maxLevel: number; // максимальный достигнутый уровень (на основе выполненных дней)
  leftChubriks: number; // количество ушедших чубриков (невыполненных чеклистов)
};

export function useAchievements() {
  const [metrics, setMetrics] = useState<AchievementMetrics>({
    cleanedChubriks: 0,
    currentStreak: 0,
    bestStreak: 0,
    maxLevel: 0,
    leftChubriks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = async () => {
    try {
      // Статистика учитывает ВСЕ чеклисты (и до пропуска, и после)
      const checklists = await checklistStorage.getChecklists();
      
      // Сортируем по дате (старые первыми)
      const sorted = [...checklists].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // Максимальный достигнутый уровень чубрика (сохраняется навсегда)
      // Получаем из профиля, так как это метрика которая не сбрасывается
      const { storage } = await import('@/utils/storage');
      const profile = await storage.getProfile();
      
      // Количество полностью выращенных чубриков (28/28) - берем из профиля
      const cleanedChubriks = profile?.chubriks || 0;
      
      // Количество ушедших чубриков (пропущенных чеклистов)
      const leftChubriks = checklists.filter(c => c.status === 'missed').length;

      // Подсчет серий
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      for (const checklist of sorted) {
        if (checklist.status === 'done') {
          tempStreak += 1;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Текущая серия (с конца)
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].status === 'done') {
          currentStreak += 1;
        } else {
          break;
        }
      }

      // Максимальный достигнутый уровень чубрика (сохраняется навсегда)
      const maxLevel = profile?.chubrikMaxLevel || 1;

      setMetrics({
        cleanedChubriks,
        currentStreak,
        bestStreak,
        maxLevel,
        leftChubriks,
      });
    } catch (error) {
      console.error('Error calculating achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    reload: calculateMetrics,
  };
}

