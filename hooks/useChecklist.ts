import { useProfile } from '@/hooks/useProfile';
import { Checklist, TaskStatus } from '@/types/checklist';
import { Room } from '@/types/profile';
import { generateChecklist, getTodayDateString } from '@/utils/checklistGenerator';
import { checklistStorage } from '@/utils/checklistStorage';
import { storage } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

export function useChecklist(rooms: Room[]) {
  const { profile } = useProfile();
  const [currentChecklist, setCurrentChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTodayChecklist = useCallback(async () => {
    try {
      const today = getTodayDateString();

      // Проверяем, сколько дней прошло с последнего визита (до обновления timestamp)
      const daysSinceLastVisit = await storage.getDaysSinceLastVisit();
      const MAX_MISSED_DAYS = 3; // Максимум 3 дня пропуска

      // Обновляем timestamp последнего визита при каждом открытии приложения
      // Это делаем после проверки, чтобы правильно определить пропущенные дни
      await storage.setLastVisitTimestamp(Date.now());

      // Проверяем, прошло ли 24 часа с момента создания последнего чеклиста
      const lastChecklist = await checklistStorage.getLastChecklist();
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

      // Если пользователь не заходил, генерируем пропущенные чеклисты за дни отсутствия (первые 3 дня)
      if (daysSinceLastVisit > 0 && daysSinceLastVisit <= MAX_MISSED_DAYS && lastChecklist) {
        const daysToGenerate = Math.min(daysSinceLastVisit, MAX_MISSED_DAYS);
        const lastChecklistDate = new Date(lastChecklist.date);

        // Генерируем пропущенные чеклисты за каждый день отсутствия
        for (let i = 1; i <= daysToGenerate; i++) {
          const missedDate = new Date(lastChecklistDate);
          missedDate.setDate(missedDate.getDate() + i);
          const missedDateString = `${missedDate.getFullYear()}-${String(
            missedDate.getMonth() + 1,
          ).padStart(2, '0')}-${String(missedDate.getDate()).padStart(2, '0')}`;

          // Проверяем, есть ли уже чеклист на эту дату
          const existingChecklist = await checklistStorage.getChecklistByDate(missedDateString);
          if (!existingChecklist) {
            // Создаем пропущенный чеклист (ушедший чубрик)
            const selectedRooms = rooms.filter((r) => r.checked);
            let missedChecklist: Checklist;

            if (selectedRooms.length > 0) {
              missedChecklist = await generateChecklist(rooms, missedDateString, profile);
            } else {
              missedChecklist = {
                id: `checklist-${missedDateString}`,
                date: missedDateString,
                status: 'missed',
                tasks: [],
                createdAt: lastChecklist.createdAt + i * TWENTY_FOUR_HOURS,
              };
            }

            // Помечаем все задачи как пропущенные
            missedChecklist.status = 'missed';
            missedChecklist.tasks = missedChecklist.tasks.map((task) => ({
              ...task,
              status: 'missed' as TaskStatus,
            }));

            await checklistStorage.saveChecklist(missedChecklist);
            console.log(`Generated missed checklist for ${missedDateString} (day ${i} of absence)`);
          }
        }
      }

      let checklist: Checklist | null = null;

      if (lastChecklist && now - lastChecklist.createdAt < TWENTY_FOUR_HOURS) {
        // Если прошло менее 24 часов, используем последний чеклист (независимо от даты)
        console.log(`Less than 24 hours since last checklist creation, using existing checklist`);
        checklist = lastChecklist;
      } else {
        // Проверяем, не пропустил ли пользователь более 3 дней
        if (daysSinceLastVisit > MAX_MISSED_DAYS) {
          // Если пользователь не заходил более 3 дней, создаем новый чеклист
          // Это становится новым временем отсчета для генераций и уведомлений
          console.log(
            `User hasn't visited for ${daysSinceLastVisit} days (more than ${MAX_MISSED_DAYS}), creating new checklist as reset point`,
          );

          // Сохраняем timestamp последней генерации (новое время отсчета)
          await storage.setLastGenerationTimestamp(now);

          // Создаем новый чеклист
          const selectedRooms = rooms.filter((r) => r.checked);
          if (selectedRooms.length > 0) {
            checklist = await generateChecklist(rooms, today, profile);
            await checklistStorage.saveChecklist(checklist);
            console.log(
              `New checklist generated after ${daysSinceLastVisit} days absence - new reset point`,
            );
          } else {
            // Если нет выбранных комнат, создаем пустой чеклист
            checklist = {
              id: `checklist-${today}`,
              date: today,
              status: 'in_progress',
              tasks: [],
              createdAt: now,
            };
            await checklistStorage.saveChecklist(checklist);
          }
        } else {
          // Прошло более 24 часов или нет последнего чеклиста - создаем новый
          // Проверяем, что есть выбранные комнаты для генерации
          const selectedRooms = rooms.filter((r) => r.checked);

          // Если это первая генерация, устанавливаем timestamp последней генерации
          const lastGenerationTimestamp = await storage.getLastGenerationTimestamp();
          if (!lastGenerationTimestamp) {
            await storage.setLastGenerationTimestamp(now);
          }

          if (selectedRooms.length > 0) {
            checklist = await generateChecklist(rooms, today, profile);
            await checklistStorage.saveChecklist(checklist);
            console.log(`Checklist generated for ${today} (24 hours passed since last)`);
          } else {
            // Если нет выбранных комнат, создаем пустой чеклист
            checklist = {
              id: `checklist-${today}`,
              date: today,
              status: 'in_progress',
              tasks: [],
              createdAt: now,
            };
            await checklistStorage.saveChecklist(checklist);
          }
        }
      }

      setCurrentChecklist(checklist);
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  }, [rooms, profile]);

  useEffect(() => {
    loadTodayChecklist();
  }, [loadTodayChecklist]);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      if (!currentChecklist) return;

      const updatedTasks = currentChecklist.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      );

      // Определяем статус чеклиста
      const allDone = updatedTasks.every((t) => t.status === 'done');
      const hasMissed = updatedTasks.some((t) => t.status === 'missed');

      let checklistStatus: 'in_progress' | 'done' | 'missed' = 'in_progress';
      if (allDone) {
        checklistStatus = 'done';
      } else if (hasMissed) {
        // Если есть пропущенные, но не все выполнены - все еще в процессе
        // Статус "missed" будет установлен только если день прошел и не все выполнены
        checklistStatus = 'in_progress';
      }

      const updatedChecklist: Checklist = {
        ...currentChecklist,
        tasks: updatedTasks,
        status: checklistStatus,
      };

      await checklistStorage.saveChecklist(updatedChecklist);
      setCurrentChecklist(updatedChecklist);

      // Обновляем прогресс чубрика при изменении статуса чеклиста
      // Импортируем динамически функцию обновления прогресса
      try {
        const { updateChubrikProgress } = await import('@/hooks/useChubrikProgress');
        await updateChubrikProgress();
      } catch (error) {
        console.error('Error updating chubrik progress:', error);
      }
    },
    [currentChecklist],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!currentChecklist) return;

      const task = currentChecklist.tasks.find((t) => t.id === taskId);
      if (!task) return;

      let newStatus: TaskStatus;
      if (task.status === 'done') {
        newStatus = 'in_progress';
      } else {
        newStatus = 'done';
      }

      await updateTaskStatus(taskId, newStatus);
    },
    [currentChecklist, updateTaskStatus],
  );

  return {
    currentChecklist,
    loading,
    toggleTask,
    updateTaskStatus,
    reloadChecklist: loadTodayChecklist,
  };
}
