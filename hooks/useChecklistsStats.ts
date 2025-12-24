import { useEffect, useState } from 'react';
import { Checklist } from '@/types/checklist';
import { checklistStorage } from '@/utils/checklistStorage';
import { formatDate } from '@/utils/checklistGenerator';
import { getTodayDateString } from '@/utils/checklistGenerator';

export function useChecklistsStats() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const allChecklists = await checklistStorage.getChecklists();
      
      // Статистика учитывает ВСЕ чеклисты (и до пропуска, и после)
      // Обновляем статусы старых чеклистов по времени (24 часа), а не по дате
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      
      const updatedChecklists = allChecklists.map(checklist => {
        // Если чеклист не выполнен и прошло более 24 часов с создания - помечаем как пропущенный (ушедший чубрик)
        if (checklist.status === 'in_progress') {
          const timeSinceCreation = now - checklist.createdAt;
          
          // Если прошло более 24 часов, помечаем как пропущенный
          if (timeSinceCreation >= TWENTY_FOUR_HOURS) {
            const allDone = checklist.tasks.every(t => t.status === 'done');
            return {
              ...checklist,
              status: allDone ? 'done' : 'missed',
              tasks: checklist.tasks.map(task => {
                if (task.status === 'in_progress') {
                  return { ...task, status: 'missed' as const };
                }
                return task;
              }),
            };
          }
        }
        return checklist;
      });

      // Сохраняем обновленные статусы
      const hasChanges = JSON.stringify(allChecklists) !== JSON.stringify(updatedChecklists);
      if (hasChanges) {
        await checklistStorage.saveChecklists(updatedChecklists);
        
        // Обновляем прогресс чубрика при изменении статусов чеклистов
        try {
          const { updateChubrikProgress } = await import('@/hooks/useChubrikProgress');
          await updateChubrikProgress();
        } catch (error) {
          console.error('Error updating chubrik progress:', error);
        }
      }

      setChecklists(updatedChecklists);
    } catch (error) {
      console.error('Error loading checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Подсчет статистики
  const totalClosed = checklists.filter(c => c.status === 'done').length;
  
  // Рекорд закрытых подряд
  const recordStreak = (() => {
    let best = 0;
    let current = 0;
    
    // Сортируем по дате (старые первыми)
    const sorted = [...checklists].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    for (const checklist of sorted) {
      if (checklist.status === 'done') {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    
    return best;
  })();

  return {
    checklists,
    loading,
    totalClosed,
    recordStreak,
    reload: loadChecklists,
  };
}

