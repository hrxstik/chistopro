import { Checklist } from '@/types/checklist';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      return checklists.find((c) => c.date === date) || null;
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

      const index = checklists.findIndex((c) => c.id === checklist.id);

      if (index >= 0) {
        // Обновляем существующий чеклист
        console.log(`Updating existing checklist with id: ${checklist.id}`);
        checklists[index] = checklist;
      } else {
        // Добавляем новый чеклист (разрешаем несколько чеклистов на одну дату)
        console.log(`Adding new checklist with id: ${checklist.id}, date: ${checklist.date}`);
        checklists.push(checklist);
      }

      // Сортируем по времени создания (новые первыми), а не по дате
      checklists.sort((a, b) => b.createdAt - a.createdAt);

      await this.saveChecklists(checklists);
      console.log(`Saved checklist. Total checklists: ${checklists.length}`);
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
