import { HouseholdMember } from './household';

export type Room = {
  id: string;
  name: string;
  count: string;
  checked: boolean;
  isCustom: boolean;
};

export type UserProfile = {
  // Step 1
  name: string;
  age: string;
  gender: 'male' | 'female' | null;

  // Step 2
  profession: string;

  // Step 3
  householdMembers: HouseholdMember[];

  // Step 4
  area: string;
  hasPets: boolean;
  rooms: Room[];

  // Notifications
  notificationsEnabled: boolean;

  // Stats
  tasksDone: number;
  checklistRecord: number;
  achievements: number;
  chubriks: number;

  // Chubrik progress
  chubrikProgress: number; // Текущий прогресс (0-28)
  chubrikMaxLevel: number; // Максимальный достигнутый уровень (1-4), сохраняется навсегда

  // Avatar
  avatarIndex: number;
};
