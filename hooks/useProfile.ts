import { UserProfile } from '@/types/profile';
import { storage } from '@/utils/storage';
import { useEffect, useState } from 'react';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await storage.getProfile();
      if (savedProfile) {
        // Создаем новый объект для миграции (чтобы избежать ошибки "read-only")
        let updatedProfile: UserProfile = { ...savedProfile };
        let needsSave = false;

        // Инициализируем поля прогресса чубрика, если их нет
        if (updatedProfile.chubrikProgress === undefined) {
          updatedProfile = { ...updatedProfile, chubrikProgress: 0 };
          needsSave = true;
        }
        if (updatedProfile.chubrikMaxLevel === undefined) {
          updatedProfile = { ...updatedProfile, chubrikMaxLevel: 1 };
          needsSave = true;
        }

        // Миграция: удаляем поле timezone, если оно есть
        if ('timezone' in updatedProfile) {
          const { timezone, ...profileWithoutTimezone } = updatedProfile as any;
          updatedProfile = profileWithoutTimezone;
          needsSave = true;
        }

        // Миграция: преобразуем petsCount (string) в hasPets (boolean)
        if (
          'petsCount' in updatedProfile &&
          typeof (updatedProfile as any).petsCount === 'string'
        ) {
          const petsCount = (updatedProfile as any).petsCount;
          const { petsCount: _, ...profileWithoutPetsCount } = updatedProfile as any;
          updatedProfile = {
            ...profileWithoutPetsCount,
            hasPets: parseInt(petsCount) > 0,
          };
          needsSave = true;
        }

        // Сохраняем обновленный профиль только если были изменения
        if (needsSave) {
          await storage.saveProfile(updatedProfile);
        }
        setProfile(updatedProfile);
      } else {
        setProfile(savedProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // ВАЖНО: Всегда читаем актуальный профиль из storage перед обновлением,
      // чтобы не потерять данные (например, прогресс чубрика), которые могли быть обновлены в другом месте
      const currentProfile = await storage.getProfile();
      if (!currentProfile) {
        console.warn('Cannot update profile: profile not found in storage');
        return;
      }

      // Объединяем актуальный профиль с обновлениями
      const updatedProfile = { ...currentProfile, ...updates };
      await storage.saveProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
  };
}
