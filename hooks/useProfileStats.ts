import { checklistStorage } from '@/utils/checklistStorage';
import { useEffect, useState } from 'react';

export function useProfileStats() {
  const [stats, setStats] = useState({
    tasksDone: 0,
    checklistRecord: 0,
    achievements: 0,
    chubriks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Статистика учитывает ВСЕ чеклисты (и до пропуска, и после)
      const checklists = await checklistStorage.getChecklists();

      // Подсчитываем выполненные задачи
      let tasksDone = 0;
      for (const checklist of checklists) {
        tasksDone += checklist.tasks.filter((t) => t.status === 'done').length;
      }

      // Рекорд закрытых чеклистов подряд
      // Сортируем по времени создания (старые первыми), а не по дате
      const sorted = [...checklists].sort((a, b) => a.createdAt - b.createdAt);

      let checklistRecord = 0;
      let currentStreak = 0;
      for (const checklist of sorted) {
        if (checklist.status === 'done') {
          currentStreak += 1;
          checklistRecord = Math.max(checklistRecord, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      // Количество очищенных чубриков (выращенных чубриков из профиля, не выполненных чеклистов)
      const { storage } = await import('@/utils/storage');
      const profile = await storage.getProfile();
      const chubriks = profile?.chubriks || 0; // Количество выращенных чубриков (28/28)
      const maxLevel = profile?.chubrikMaxLevel || 1;

      // Подсчитываем количество выполненных достижений по той же логике что в achievements.tsx
      let achievementsCount = 0;

      // Достижения по уровням чубрика (care)
      if (maxLevel >= 2) achievementsCount++; // Ухажёр за чубриком I (уровень 2)
      if (maxLevel >= 3) achievementsCount++; // Ухажёр за чубриком II (уровень 3)
      if (maxLevel >= 4) achievementsCount++; // Ухажёр за чубриком III (уровень 4)
      if (maxLevel >= 5) achievementsCount++; // Ухажёр за чубриком IV (уровень 5)

      // Достижения по сериям (streak)
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
      if (bestStreak >= 7) achievementsCount++; // Упорный I (7 чеклистов)
      if (bestStreak >= 28) achievementsCount++; // Упорный II (28 чеклистов)
      if (bestStreak >= 90) achievementsCount++; // Упорный III (90 чеклистов)

      // Достижения по коллекции чубриков (collector)
      if (chubriks >= 1) achievementsCount++; // Коллекционер чубриков I (1 чубрик)
      if (chubriks >= 3) achievementsCount++; // Коллекционер чубриков II (3 чубрика)
      if (chubriks >= 5) achievementsCount++; // Коллекционер чубриков III (5 чубриков)
      if (chubriks >= 10) achievementsCount++; // Коллекционер чубриков IV (10 чубриков)

      // Достижения по пропущенным чеклистам (offender)
      const leftChubriks = checklists.filter((c) => c.status === 'missed').length;
      if (leftChubriks >= 10) achievementsCount++; // Обидчик чубриков I (10 пропущенных)
      if (leftChubriks >= 20) achievementsCount++; // Обидчик чубриков II (20 пропущенных)
      if (leftChubriks >= 30) achievementsCount++; // Обидчик чубриков III (30 пропущенных)

      setStats({
        tasksDone,
        checklistRecord,
        achievements: achievementsCount,
        chubriks,
      });
    } catch (error) {
      console.error('Error loading profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    reload: loadStats,
  };
}
