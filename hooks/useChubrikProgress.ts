import { storage } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

// Единая константа для количества чеклистов для полного роста чубрика
export const TOTAL_DAYS = 8; // Для теста 8 вместо 28 (по 2 чеклиста на уровень)
const LEVEL_THRESHOLDS = [0, 1, 2, 3, 4]; // Пороги для уровней: 1, 2, 3, 4, выращен

// Глобальная переменная для хранения функции перезагрузки прогресса
let globalReloadProgress: (() => Promise<void>) | null = null;

// Экспортируем функцию для установки глобальной функции перезагрузки
export function setGlobalReloadProgress(reloadFn: (() => Promise<void>) | null) {
  globalReloadProgress = reloadFn;
}

// Экспортируем функцию для вызова глобальной перезагрузки
export async function triggerReloadProgress() {
  if (globalReloadProgress) {
    await globalReloadProgress();
  }
}

// Вычисляет уровень на основе прогресса используя LEVEL_THRESHOLDS
// Распределение: по TOTAL_DAYS / 4 чеклиста на уровень
// Например, если TOTAL_DAYS = 8, то по 2 чеклиста на уровень:
// - level 1: progress >= 0 (0-1 чеклиста)
// - level 2: progress >= 2 (2-3 чеклиста)
// - level 3: progress >= 4 (4-5 чеклистов)
// - level 4: progress >= 6 (6-7 чеклистов)
// - выращен: progress >= 8 (8 чеклистов)
function calculateLevel(progressValue: number): number {
  const maxLevelIndex = LEVEL_THRESHOLDS.length - 1; // 4 (последний индекс)
  const step = TOTAL_DAYS / maxLevelIndex; // TOTAL_DAYS / 4 (например, 8/4 = 2)

  // Идем по порогам с конца (от большего к меньшему)
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i] * step; // Порог в единицах прогресса
    if (progressValue >= threshold) {
      // Уровень = индекс + 1 (так как LEVEL_THRESHOLDS[0] = 0 -> level 1)
      return i + 1;
    }
  }
  return 1; // По умолчанию уровень 1
}

// Экспортируем функцию для обновления прогресса из других хуков
export async function updateChubrikProgress(): Promise<void> {
  try {
    const { storage } = await import('@/utils/storage');
    const { checklistStorage } = await import('@/utils/checklistStorage');

    const profile = await storage.getProfile();
    if (!profile) return;

    // Получаем последний чеклист для проверки его статуса
    const lastChecklist = await checklistStorage.getLastChecklist();
    if (!lastChecklist) return;

    const currentProgress = profile.chubrikProgress || 0;
    const currentChubriks = profile.chubriks || 0;
    const currentMaxLevel = profile.chubrikMaxLevel || 1;

    let newProgress = currentProgress;
    let newChubriks = currentChubriks;
    let newMaxLevel = currentMaxLevel;

    // Простая логика:
    // 1. Если чеклист выполнен - прогресс++
    // 2. Если пропущен - прогресс = 0
    // 3. Если прогресс достиг максимума - прогресс = 0 и chubriks++
    if (lastChecklist.status === 'done') {
      // Чеклист выполнен - увеличиваем прогресс
      newProgress = Math.min(currentProgress + 1, TOTAL_DAYS);

      // Вычисляем текущий уровень на основе нового прогресса
      const currentLevel = calculateLevel(newProgress);

      // Обновляем максимальный уровень за все время (если текущий уровень выше)
      if (currentLevel > newMaxLevel) {
        newMaxLevel = currentLevel;
      }

      // Если прогресс достиг максимума - переходим на следующего чубрика
      if (newProgress >= TOTAL_DAYS && currentProgress < TOTAL_DAYS) {
        newChubriks = currentChubriks + 1;
        newProgress = 0; // Обнуляем прогресс для нового чубрика
        // chubrikMaxLevel НЕ обнуляем - это максимальный достигнутый уровень за все время
        console.log(
          `Chubrik ${currentChubriks + 1} completed! Moving to chubrik ${
            newChubriks + 1
          }, resetting progress`,
        );
      }
    } else if (lastChecklist.status === 'missed') {
      // Чеклист пропущен - сбрасываем прогресс
      newProgress = 0;
      // chubrikMaxLevel не меняется при пропуске
    }
    // Если статус 'in_progress' - ничего не делаем, прогресс не меняется

    await storage.saveProfile({
      ...profile,
      chubrikProgress: newProgress,
      chubrikMaxLevel: newMaxLevel,
      chubriks: newChubriks,
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

  // Загружает прогресс чубрика из профиля (без пересчета)
  const loadProgress = useCallback(async () => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        setLoading(false);
        return;
      }

      // Только загружаем данные из профиля для отображения (без пересчета)
      const currentProgress = profile.chubrikProgress || 0;
      const level = calculateLevel(currentProgress);
      const maxLevel = profile.chubrikMaxLevel || 1;

      setProgress(currentProgress);
      setCurrentLevel(level);
      setMaxLevel(maxLevel);
    } catch (error) {
      console.error('Error loading chubrik progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружает и обновляет прогресс чубрика (с пересчетом)
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
      await loadProgress();
    } catch (error) {
      console.error('Error updating chubrik progress:', error);
    }
  }, [loadProgress]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Устанавливаем глобальную функцию перезагрузки при монтировании компонента
  // Используем loadProgress (только загрузка данных, без пересчета)
  useEffect(() => {
    setGlobalReloadProgress(loadProgress);
    return () => {
      setGlobalReloadProgress(null);
    };
  }, [loadProgress]);

  return {
    progress,
    currentLevel,
    maxLevel,
    loading,
    reload: loadProgress, // reload только загружает данные, не пересчитывает
    update: updateProgress, // update пересчитывает прогресс
  };
}
