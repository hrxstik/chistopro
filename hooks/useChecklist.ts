import { useProfile } from '@/hooks/useProfile';
import { Checklist, TaskStatus } from '@/types/checklist';
import { Room } from '@/types/profile';
import { generateChecklist, getTodayDateString } from '@/utils/checklistGenerator';
import { checklistStorage } from '@/utils/checklistStorage';
import { storage } from '@/utils/storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useChecklist(rooms: Room[]) {
  const { profile, loading: profileLoading, loadProfile } = useProfile();
  const [currentChecklist, setCurrentChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false); // Защита от повторных вызовов

  const loadTodayChecklist = useCallback(async () => {
    // Защита от повторных вызовов (например, из-за Strict Mode)
    if (isLoadingRef.current) {
      console.log('Already loading checklist, skipping...');
      return;
    }

    // Ждем загрузки профиля и комнат перед генерацией чеклиста
    if (profileLoading) {
      console.log('Profile still loading, waiting...');
      return;
    }

    if (!profile || !rooms || rooms.length === 0) {
      console.log('Profile or rooms not loaded yet, waiting...');
      return;
    }

    isLoadingRef.current = true;
    try {
      const today = getTodayDateString();
      const now = Date.now();

      // Обновляем timestamp последнего визита
      await storage.setLastVisitTimestamp(now);

      // Получаем последний чеклист
      const lastChecklist = await checklistStorage.getLastChecklist();

      let checklist: Checklist | null = null;

      // Если есть последний чеклист и он выполнен (все задачи done) - генерируем новый
      if (lastChecklist && lastChecklist.status === 'done') {
        // Если есть последний чеклист и он выполнен - генерируем новый
        console.log('Last checklist is done, generating new one');
        const selectedRooms = rooms.filter((r) => r.checked);
        console.log(`Selected rooms count: ${selectedRooms.length}, total rooms: ${rooms.length}`);
        if (selectedRooms.length > 0) {
          checklist = await generateChecklist(rooms, today, profile);
          console.log(`Generated checklist with ${checklist.tasks.length} tasks`);
          if (checklist.tasks.length === 0) {
            console.warn('Generated checklist is empty! This should not happen.');
          }
          await checklistStorage.saveChecklist(checklist);
        } else {
          console.log('No rooms selected or rooms not loaded yet, skipping checklist creation');
          // Не создаем пустой чеклист - просто используем последний выполненный
          checklist = lastChecklist;
        }
      } else if (lastChecklist && lastChecklist.status === 'in_progress') {
        // Если есть незавершенный чеклист - проверяем, не пустой ли он
        if (lastChecklist.tasks.length === 0) {
          // Если чеклист пустой - удаляем его и генерируем новый
          console.log('Found empty in-progress checklist, removing it and generating new one');
          const allChecklists = await checklistStorage.getChecklists();
          const filteredChecklists = allChecklists.filter((c) => c.id !== lastChecklist.id);
          await checklistStorage.saveChecklists(filteredChecklists);

          const selectedRooms = rooms.filter((r) => r.checked);
          console.log(
            `Selected rooms count: ${selectedRooms.length}, total rooms: ${rooms.length}`,
          );
          if (selectedRooms.length > 0) {
            checklist = await generateChecklist(rooms, today, profile);
            console.log(`Generated new checklist with ${checklist.tasks.length} tasks`);
            if (checklist.tasks.length === 0) {
              console.warn('Generated checklist is empty! This should not happen.');
            }
            await checklistStorage.saveChecklist(checklist);
          } else {
            console.log('No rooms selected or rooms not loaded yet, skipping checklist creation');
            // Не создаем пустой чеклист - вернем null, чеклист создастся когда комнаты загрузятся
            checklist = null;
          }
        } else {
          // Если есть задачи - используем его
          console.log('Using existing in-progress checklist');
          checklist = lastChecklist;
        }
      } else {
        // Нет чеклиста - создаем новый
        console.log('No checklist found, generating new one');
        const selectedRooms = rooms.filter((r) => r.checked);
        console.log(`Selected rooms count: ${selectedRooms.length}, total rooms: ${rooms.length}`);
        if (selectedRooms.length > 0) {
          checklist = await generateChecklist(rooms, today, profile);
          console.log(`Generated checklist with ${checklist.tasks.length} tasks`);
          if (checklist.tasks.length === 0) {
            console.warn('Generated checklist is empty! This should not happen.');
          }
          await checklistStorage.saveChecklist(checklist);
        } else {
          console.log('No rooms selected or rooms not loaded yet, skipping checklist creation');
          // Не создаем пустой чеклист - вернем null, чеклист создастся когда комнаты загрузятся
          checklist = null;
        }
      }

      setCurrentChecklist(checklist);
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [rooms, profile, profileLoading]);

  useEffect(() => {
    // Ждем загрузки профиля и комнат перед вызовом loadTodayChecklist
    if (!profileLoading && profile && rooms && rooms.length > 0) {
      loadTodayChecklist();
    }
  }, [loadTodayChecklist, profileLoading, profile, rooms]);

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

      // Проверяем, был ли чеклист уже выполнен до этого изменения
      const wasAlreadyDone = currentChecklist.status === 'done';

      setCurrentChecklist(updatedChecklist);

      // Обновляем прогресс чубрика ТОЛЬКО когда чеклист переходит в статус 'done'
      // (был 'in_progress', стал 'done') - вызываем один раз
      if (checklistStatus === 'done' && !wasAlreadyDone) {
        console.log('Checklist completed, updating chubrik progress');
        try {
          const { updateChubrikProgress, triggerReloadProgress } = await import(
            '@/hooks/useChubrikProgress'
          );
          // Передаем завершенный чеклист напрямую, чтобы гарантировать правильное обновление прогресса
          await updateChubrikProgress(updatedChecklist);
          // Перезагружаем профиль после обновления прогресса, чтобы обновился chubriks и интерфейс
          await loadProfile();
          // Явно вызываем перезагрузку прогресса в хуке, чтобы обновилось состояние
          await triggerReloadProgress();
        } catch (error) {
          console.error('Error updating chubrik progress:', error);
        }

        // Генерируем новый чеклист после обновления прогресса
        console.log('Checklist completed, loading new one');
        await loadTodayChecklist();
      }
    },
    [currentChecklist, rooms, profile],
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
