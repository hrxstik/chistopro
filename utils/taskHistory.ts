import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checklist } from '@/types/checklist';

const TASK_HISTORY_KEY = '@chistopro:taskHistory';
const LAUNDRY_SEQUENCE_KEY = '@chistopro:laundrySequence';

// История задач для комнаты
export type RoomTaskHistory = {
  roomName: string; // Название комнаты или "GENERAL" для общих задач
  taskIds: number[]; // ID задач из банка
  dates: string[]; // Даты использования задач (YYYY-MM-DD)
  taskTypes: string[]; // Типы задач для проверки дубликатов в один день
};

// История последовательности стирки (задачи 32, 33, 34)
export type LaundrySequence = {
  lastTask32Date: string | null; // Дата последней задачи 32
  lastTask33Date: string | null; // Дата последней задачи 33
  lastTask34Date: string | null; // Дата последней задачи 34
  cooldownUntil: string | null; // Дата до которой нельзя ставить задачу 32 (через неделю после 34)
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

  // Получает историю последовательности стирки
  async getLaundrySequence(): Promise<LaundrySequence> {
    try {
      const jsonValue = await AsyncStorage.getItem(LAUNDRY_SEQUENCE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : {
        lastTask32Date: null,
        lastTask33Date: null,
        lastTask34Date: null,
        cooldownUntil: null,
      };
    } catch (error) {
      console.error('Error getting laundry sequence:', error);
      return {
        lastTask32Date: null,
        lastTask33Date: null,
        lastTask34Date: null,
        cooldownUntil: null,
      };
    }
  },

  // Сохраняет историю последовательности стирки
  async saveLaundrySequence(sequence: LaundrySequence): Promise<void> {
    try {
      const jsonValue = JSON.stringify(sequence);
      await AsyncStorage.setItem(LAUNDRY_SEQUENCE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving laundry sequence:', error);
      throw error;
    }
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
};

