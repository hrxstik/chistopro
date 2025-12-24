import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/profile';
import { storage } from '@/utils/storage';

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
        // Инициализируем поля прогресса чубрика, если их нет
        if (savedProfile.chubrikProgress === undefined) {
          savedProfile.chubrikProgress = 0;
        }
        if (savedProfile.chubrikMaxLevel === undefined) {
          savedProfile.chubrikMaxLevel = 1;
        }
        
        // Удаляем поле timezone, если оно есть (миграция для старых профилей)
        if ('timezone' in savedProfile) {
          const { timezone, ...profileWithoutTimezone } = savedProfile as any;
          await storage.saveProfile(profileWithoutTimezone);
          setProfile(profileWithoutTimezone);
        } else {
          // Сохраняем обновленный профиль
          await storage.saveProfile(savedProfile);
          setProfile(savedProfile);
        }
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
    if (!profile) return;
    
    try {
      const updatedProfile = { ...profile, ...updates };
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

