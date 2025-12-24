import { UserProfile } from '@/types/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@chistopro:profile';
const LAST_NOTIFICATION_DATE_KEY = '@chistopro:lastNotificationDate';
const LAST_NOTIFICATION_TIMESTAMP_KEY = '@chistopro:lastNotificationTimestamp';
const APP_EXIT_TIMESTAMP_KEY = '@chistopro:appExitTimestamp';
const LAST_VISIT_TIMESTAMP_KEY = '@chistopro:lastVisitTimestamp';
const LAST_GENERATION_TIMESTAMP_KEY = '@chistopro:lastGenerationTimestamp';

export const storage = {
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const jsonValue = JSON.stringify(profile);
      await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
    } catch (error) {
      console.error('Error clearing profile:', error);
      throw error;
    }
  },

  async getLastNotificationDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_NOTIFICATION_DATE_KEY);
    } catch (error) {
      console.error('Error getting last notification date:', error);
      return null;
    }
  },

  async setLastNotificationDate(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_NOTIFICATION_DATE_KEY, date);
    } catch (error) {
      console.error('Error setting last notification date:', error);
    }
  },

  async getLastNotificationTimestamp(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(LAST_NOTIFICATION_TIMESTAMP_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting last notification timestamp:', error);
      return null;
    }
  },

  async setLastNotificationTimestamp(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_NOTIFICATION_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error setting last notification timestamp:', error);
    }
  },

  async getAppExitTimestamp(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(APP_EXIT_TIMESTAMP_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting app exit timestamp:', error);
      return null;
    }
  },

  async setAppExitTimestamp(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(APP_EXIT_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error setting app exit timestamp:', error);
    }
  },

  async getLastVisitTimestamp(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(LAST_VISIT_TIMESTAMP_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting last visit timestamp:', error);
      return null;
    }
  },

  async setLastVisitTimestamp(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_VISIT_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error setting last visit timestamp:', error);
    }
  },

  // Проверяет, сколько дней прошло с последнего визита
  async getDaysSinceLastVisit(): Promise<number> {
    try {
      const lastVisit = await this.getLastVisitTimestamp();
      if (!lastVisit) {
        return 0; // Если никогда не заходил, считаем что заходил сегодня
      }
      const now = Date.now();
      const diffMs = now - lastVisit;
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days since last visit:', error);
      return 0;
    }
  },

  async getLastGenerationTimestamp(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(LAST_GENERATION_TIMESTAMP_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting last generation timestamp:', error);
      return null;
    }
  },

  async setLastGenerationTimestamp(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_GENERATION_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error setting last generation timestamp:', error);
    }
  },
};
