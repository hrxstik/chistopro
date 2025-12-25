import { useEffect, useState } from 'react';
import { checklistStorage } from '@/utils/checklistStorage';
import { Checklist } from '@/types/checklist';

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
        tasksDone += checklist.tasks.filter(t => t.status === 'done').length;
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

      // Количество достижений (пока упрощенно, можно расширить)
      const achievements = chubriks > 0 ? 1 : 0; // Минимум одно достижение если есть выращенные чубрики

      setStats({
        tasksDone,
        checklistRecord,
        achievements,
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

