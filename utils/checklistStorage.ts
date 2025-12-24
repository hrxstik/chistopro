import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checklist } from '@/types/checklist';

const CHECKLISTS_KEY = '@chistopro:checklists';

export const checklistStorage = {
  async saveChecklists(checklists: Checklist[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(checklists);
      await AsyncStorage.setItem(CHECKLISTS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving checklists:', error);
      throw error;
    }
  },

  async getChecklists(): Promise<Checklist[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CHECKLISTS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting checklists:', error);
      return [];
    }
  },

  async getChecklistByDate(date: string): Promise<Checklist | null> {
    try {
      const checklists = await this.getChecklists();
      return checklists.find(c => c.date === date) || null;
    } catch (error) {
      console.error('Error getting checklist by date:', error);
      return null;
    }
  },

  // Получает последний созданный чеклист (самый свежий по времени создания)
  async getLastChecklist(): Promise<Checklist | null> {
    try {
      const checklists = await this.getChecklists();
      if (checklists.length === 0) return null;
      
      // Сортируем по времени создания (новые первыми)
      const sorted = [...checklists].sort((a, b) => b.createdAt - a.createdAt);
      return sorted[0] || null;
    } catch (error) {
      console.error('Error getting last checklist:', error);
      return null;
    }
  },

  async saveChecklist(checklist: Checklist): Promise<void> {
    try {
      const checklists = await this.getChecklists();
      
      // Защита от дублирования: проверяем, есть ли уже чеклист на эту дату
      const existingByDate = checklists.find(c => c.date === checklist.date);
      if (existingByDate && existingByDate.id !== checklist.id) {
        // Если уже есть чеклист на эту дату с другим ID, не создаем новый
        console.warn(`Checklist for date ${checklist.date} already exists, skipping duplicate`);
        return;
      }
      
      const index = checklists.findIndex(c => c.id === checklist.id);
      
      if (index >= 0) {
        // Обновляем существующий чеклист
        checklists[index] = checklist;
      } else {
        // Добавляем новый чеклист
        checklists.push(checklist);
      }
      
      // Сортируем по дате (новые первыми)
      checklists.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      
      await this.saveChecklists(checklists);
    } catch (error) {
      console.error('Error saving checklist:', error);
      throw error;
    }
  },

  async clearChecklists(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHECKLISTS_KEY);
    } catch (error) {
      console.error('Error clearing checklists:', error);
      throw error;
    }
  },
};

