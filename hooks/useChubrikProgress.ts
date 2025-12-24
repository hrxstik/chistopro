import { useEffect, useState, useCallback } from 'react';
import { checklistStorage } from '@/utils/checklistStorage';
import { storage } from '@/utils/storage';
import { Checklist } from '@/types/checklist';

const MAX_PROGRESS = 28;
const LEVEL_THRESHOLDS = [0, 7, 14, 21, 28]; // Пороги для уровней: 1, 2, 3, 4, выращен

// Вычисляет уровень на основе прогресса
function calculateLevel(progressValue: number): number {
  if (progressValue >= 28) return 4; // Выращен
  if (progressValue >= 21) return 4;
  if (progressValue >= 14) return 3;
  if (progressValue >= 7) return 2;
  return 1;
}

// Экспортируем функцию для обновления прогресса из других хуков
export async function updateChubrikProgress(): Promise<void> {
  try {
    const { storage } = await import('@/utils/storage');
    const { checklistStorage } = await import('@/utils/checklistStorage');
    
    const profile = await storage.getProfile();
    if (!profile) return;

    const allChecklists = await checklistStorage.getChecklists();
    const sortedChecklists = [...allChecklists].sort((a, b) => a.createdAt - b.createdAt);

    // Считаем последовательные выполненные чеклисты с конца (самые новые первыми)
    // Если встретили пропущенный чеклист - останавливаемся и сбрасываем прогресс
    // Если встретили in_progress - не считаем, но продолжаем проверять дальше
    let currentProgress = 0;
    let foundMissed = false;

    // Идем с конца списка (самые новые чеклисты)
    for (let i = sortedChecklists.length - 1; i >= 0; i--) {
      const checklist = sortedChecklists[i];
      
      if (checklist.status === 'done') {
        // Если это выполненный чеклист и мы еще не встретили пропуск - увеличиваем прогресс
        if (!foundMissed) {
          currentProgress++;
        }
      } else if (checklist.status === 'missed') {
        // Если встретили пропущенный чеклист - останавливаемся и сбрасываем прогресс
        foundMissed = true;
        currentProgress = 0;
        break;
      }
      // Если статус 'in_progress' - не считаем, но и не останавливаемся (может быть еще не завершен)
    }

    currentProgress = Math.min(currentProgress, 28);
    const level = calculateLevel(currentProgress);
    const currentMaxLevel = profile.chubrikMaxLevel || 1;
    const newMaxLevel = Math.max(currentMaxLevel, level);

    let grownChubriks = profile.chubriks || 0;
    if (currentProgress >= 28) {
      grownChubriks += 1;
      currentProgress = 0;
    }

    await storage.saveProfile({
      ...profile,
      chubrikProgress: currentProgress,
      chubrikMaxLevel: newMaxLevel,
      chubriks: grownChubriks,
    });
  } catch (error) {
    console.error('Error updating chubrik progress:', error);
  }
}

export function useChubrikProgress() {
  const [progress, setProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  // Загружает и обновляет прогресс чубрика
  const updateProgress = useCallback(async () => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        setLoading(false);
        return;
      }

      // Используем общую функцию обновления прогресса
      await updateChubrikProgress();

      // Загружаем обновленные данные из профиля для отображения
      const updatedProfile = await storage.getProfile();
      if (updatedProfile) {
        const currentProgress = updatedProfile.chubrikProgress || 0;
        const level = calculateLevel(currentProgress);
        const maxLevel = updatedProfile.chubrikMaxLevel || 1;

        setProgress(currentProgress);
        setCurrentLevel(level);
        setMaxLevel(maxLevel);
      }
    } catch (error) {
      console.error('Error updating chubrik progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return {
    progress,
    currentLevel,
    maxLevel,
    loading,
    reload: updateProgress,
  };
}

