import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checklist } from '@/types/checklist';

const TASK_HISTORY_KEY = '@chistopro:taskHistory';
const LAUNDRY_GENERATION_KEY = '@chistopro:laundryGeneration';

// История задач для комнаты
export type RoomTaskHistory = {
  roomName: string; // Название комнаты или "GENERAL" для общих задач
  taskIds: number[]; // ID задач из банка
  dates: string[]; // Даты использования задач (YYYY-MM-DD)
  taskTypes: string[]; // Типы задач для проверки дубликатов в один день
};

// Система отслеживания генераций для стирки
export type LaundryGeneration = {
  generationCount: number; // Количество генераций с последнего цикла стирки (0-10)
  currentLaundryStep: number; // Текущий шаг в цикле стирки (0 = нет стирки, 1 = задача 32, 2 = задача 33, 3 = задача 34)
};

export const taskHistory = {
  // Получает всю историю задач
  async getHistory(): Promise<RoomTaskHistory[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(TASK_HISTORY_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting task history:', error);
      return [];
    }
  },

  // Сохраняет историю задач
  async saveHistory(history: RoomTaskHistory[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(history);
      await AsyncStorage.setItem(TASK_HISTORY_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving task history:', error);
      throw error;
    }
  },

  // Получает историю для конкретной комнаты
  async getRoomHistory(roomName: string): Promise<RoomTaskHistory | null> {
    const history = await this.getHistory();
    return history.find(h => h.roomName === roomName) || null;
  },

  // Добавляет задачу в историю комнаты
  async addTaskToHistory(roomName: string, taskId: number, taskType: string, date: string): Promise<void> {
    const history = await this.getHistory();
    let roomHistory = history.find(h => h.roomName === roomName);

    if (!roomHistory) {
      roomHistory = {
        roomName,
        taskIds: [],
        dates: [],
        taskTypes: [],
      };
      history.push(roomHistory);
    }

    roomHistory.taskIds.push(taskId);
    roomHistory.dates.push(date);
    roomHistory.taskTypes.push(taskType);

    await this.saveHistory(history);
  },

  // Проверяет, была ли задача использована вчера для комнаты
  async wasTaskUsedYesterday(roomName: string, taskId: number, todayDate: string): Promise<boolean> {
    const roomHistory = await this.getRoomHistory(roomName);
    if (!roomHistory) return false;

    // Вычисляем дату вчера
    const today = new Date(todayDate);
    today.setDate(today.getDate() - 1);
    const yesterday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Проверяем, была ли эта задача использована вчера
    for (let i = 0; i < roomHistory.taskIds.length; i++) {
      if (roomHistory.taskIds[i] === taskId && roomHistory.dates[i] === yesterday) {
        return true;
      }
    }

    return false;
  },

  // Проверяет, был ли тип задачи использован сегодня для комнаты
  async wasTaskTypeUsedToday(roomName: string, taskType: string, todayDate: string): Promise<boolean> {
    const roomHistory = await this.getRoomHistory(roomName);
    if (!roomHistory) return false;

    for (let i = 0; i < roomHistory.taskTypes.length; i++) {
      if (roomHistory.taskTypes[i] === taskType && roomHistory.dates[i] === todayDate) {
        return true;
      }
    }

    return false;
  },

  // Проверяет, была ли задача использована сегодня для комнаты
  async wasTaskUsedToday(roomName: string, taskId: number, todayDate: string): Promise<boolean> {
    const roomHistory = await this.getRoomHistory(roomName);
    if (!roomHistory) return false;

    for (let i = 0; i < roomHistory.taskIds.length; i++) {
      if (roomHistory.taskIds[i] === taskId && roomHistory.dates[i] === todayDate) {
        return true;
      }
    }

    return false;
  },

  // Получает состояние генераций стирки
  async getLaundryGeneration(): Promise<LaundryGeneration> {
    try {
      const jsonValue = await AsyncStorage.getItem(LAUNDRY_GENERATION_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : {
        generationCount: 0,
        currentLaundryStep: 0,
      };
    } catch (error) {
      console.error('Error getting laundry generation:', error);
      return {
        generationCount: 0,
        currentLaundryStep: 0,
      };
    }
  },

  // Сохраняет состояние генераций стирки
  async saveLaundryGeneration(generation: LaundryGeneration): Promise<void> {
    try {
      const jsonValue = JSON.stringify(generation);
      await AsyncStorage.setItem(LAUNDRY_GENERATION_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving laundry generation:', error);
      throw error;
    }
  },

  // Определяет, какую задачу стирки нужно поставить на основе текущего счетчика, затем увеличивает счетчик
  async getAndIncrementLaundryGeneration(): Promise<{ taskId: number | null; newGeneration: LaundryGeneration }> {
    const current = await this.getLaundryGeneration();
    let newGeneration: LaundryGeneration;
    let taskId: number | null = null;

    // Определяем, какую задачу нужно поставить на основе ТЕКУЩЕГО счетчика
    if (current.generationCount === 0) {
      // Первая генерация цикла - задача 32
      taskId = 32;
      newGeneration = {
        generationCount: 1,
        currentLaundryStep: 1,
      };
    } else if (current.generationCount === 1) {
      // Вторая генерация цикла - задача 33
      taskId = 33;
      newGeneration = {
        generationCount: 2,
        currentLaundryStep: 2,
      };
    } else if (current.generationCount === 2) {
      // Третья генерация цикла - задача 34
      taskId = 34;
      newGeneration = {
        generationCount: 3,
        currentLaundryStep: 3,
      };
    } else if (current.generationCount >= 3 && current.generationCount < 10) {
      // Генерации 4-10: нет задач стирки, просто увеличиваем счетчик
      taskId = null;
      const nextCount = current.generationCount + 1;
      newGeneration = {
        generationCount: nextCount,
        currentLaundryStep: 0,
      };
      // Если достигли 10, на следующей генерации начнется новый цикл
    } else {
      // generationCount = 10: конец цикла, начинаем новый
      // Ставим задачу 32 и сбрасываем счетчик на 1
      taskId = 32;
      newGeneration = {
        generationCount: 1,
        currentLaundryStep: 1,
      };
    }

    await this.saveLaundryGeneration(newGeneration);
    return { taskId, newGeneration };
  },

  // Обновляет историю после генерации чеклиста
  async updateHistoryFromChecklist(checklist: Checklist): Promise<void> {
    const date = checklist.date;
    const { TASKS } = await import('./checklistGenerator');

    for (const task of checklist.tasks) {
      // Извлекаем taskId из id задачи
      // Формат: "roomName-taskId-timestamp-index"
      // Примеры: "GENERAL-27-1234567890-0" или "Кухня-1-1234567890-5"
      // Для комнат с названиями из нескольких слов: "Тренажёрный зал-20-1234567890-0"
      
      const parts = task.id.split('-');
      if (parts.length < 2) continue;

      // Ищем taskId - это первый числовой элемент после названия комнаты
      // Название комнаты может быть из нескольких частей, разделенных дефисами
      // Поэтому ищем первый числовой элемент, который является валидным ID задачи
      let taskId: number | null = null;
      
      // Начинаем поиск со второго элемента (первый - название комнаты)
      for (let i = 1; i < parts.length; i++) {
        const num = parseInt(parts[i], 10);
        // Проверяем, что это валидный ID задачи (1-100)
        if (!isNaN(num) && num >= 1 && num <= 100) {
          // Проверяем, что такой ID существует в банке задач
          if (TASKS.some(t => t.id === num)) {
            taskId = num;
            break;
          }
        }
      }
      
      if (taskId !== null) {
        const taskDef = TASKS.find(t => t.id === taskId);
        if (taskDef) {
          await this.addTaskToHistory(task.roomName, taskId, taskDef.type, date);
        }
      }
    }
  },

  // Очищает всю историю задач
  async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TASK_HISTORY_KEY);
      await AsyncStorage.removeItem(LAUNDRY_GENERATION_KEY);
    } catch (error) {
      console.error('Error clearing task history:', error);
      throw error;
    }
  },
};

