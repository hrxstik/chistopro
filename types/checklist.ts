export type TaskStatus = 'in_progress' | 'done' | 'missed';

export type ChecklistTask = {
  id: string;
  title: string;
  minutes: number;
  status: TaskStatus;
  roomName: string;
  assignedTo?: string | null; // ID сожителя или null для пользователя
};

export type ChecklistStatus = 'in_progress' | 'done' | 'missed';

export type Checklist = {
  id: string;
  date: string; // формат: YYYY-MM-DD
  status: ChecklistStatus;
  tasks: ChecklistTask[];
  createdAt: number; // timestamp
};
