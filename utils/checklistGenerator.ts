import { Room } from '@/types/profile';
import { Checklist, ChecklistTask } from '@/types/checklist';

// Банк задач по комнатам
const TASKS_BY_ROOM: Record<string, string[]> = {
  'Спальня': [
    'Заправить кровать',
    'Пропылесосить ковер',
    'Протереть пыль на мебели',
    'Разложить вещи по местам',
    'Помыть окно',
    'Почистить зеркало',
    'Протереть дверные ручки',
  ],
  'Кухня': [
    'Помыть посуду',
    'Протереть стол',
    'Помыть раковину',
    'Протереть плиту',
    'Помыть пол',
    'Протереть шкафы',
    'Вынести мусор',
    'Протереть холодильник снаружи',
  ],
  'Ванная': [
    'Почистить раковину',
    'Помыть ванну/душ',
    'Протереть зеркало',
    'Помыть пол',
    'Протереть полки',
    'Почистить унитаз',
    'Протереть дверные ручки',
  ],
  'Кабинет': [
    'Протереть стол',
    'Разложить документы',
    'Протереть пыль',
    'Пропылесосить',
    'Протереть монитор',
    'Разложить книги',
  ],
  'Гостиная': [
    'Пропылесосить',
    'Протереть пыль',
    'Помыть пол',
    'Разложить вещи',
    'Протереть телевизор',
    'Протереть подоконник',
  ],
  'Обеденная': [
    'Протереть стол',
    'Помыть пол',
    'Протереть стулья',
    'Протереть пыль',
    'Протереть люстру',
  ],
  'Подвал': [
    'Пропылесосить',
    'Протереть пыль',
    'Разложить вещи',
    'Помыть пол',
  ],
};

// Время выполнения задач (в минутах)
const TASK_DURATIONS = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15];

// Генерирует случайное время для задачи
function getRandomDuration(): number {
  return TASK_DURATIONS[Math.floor(Math.random() * TASK_DURATIONS.length)];
}

// Генерирует задачи для комнаты
function generateTasksForRoom(roomName: string, count: number): ChecklistTask[] {
  const availableTasks = TASKS_BY_ROOM[roomName] || [`Задача в ${roomName}`];
  const tasks: ChecklistTask[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count && i < availableTasks.length; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * availableTasks.length);
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    
    tasks.push({
      id: `${roomName}-${Date.now()}-${i}`,
      title: availableTasks[index],
      minutes: getRandomDuration(),
      status: 'in_progress',
      roomName,
    });
  }

  return tasks;
}

// Генерирует чеклист на основе комнат из профиля
export function generateChecklist(rooms: Room[], date: string): Checklist {
  // Фильтруем только выбранные комнаты
  const selectedRooms = rooms.filter(r => r.checked);
  
  if (selectedRooms.length === 0) {
    // Если нет выбранных комнат, создаем пустой чеклист
    return {
      id: `checklist-${date}`,
      date,
      status: 'in_progress',
      tasks: [],
      createdAt: Date.now(),
    };
  }

  const allTasks: ChecklistTask[] = [];
  let totalMinutes = 0;
  const MAX_MINUTES = 20;

  // Перемешиваем комнаты для случайного порядка
  const shuffledRooms = [...selectedRooms].sort(() => Math.random() - 0.5);

  // Генерируем задачи для каждой комнаты
  for (const room of shuffledRooms) {
    const roomCount = parseInt(room.count) || 1;
    
    // Генерируем задачи для комнаты
    const roomTasks = generateTasksForRoom(room.name, roomCount);
    
    for (const task of roomTasks) {
      if (totalMinutes + task.minutes <= MAX_MINUTES) {
        allTasks.push(task);
        totalMinutes += task.minutes;
      } else {
        // Если добавление этой задачи превысит лимит, останавливаемся
        break;
      }
    }
    
    if (totalMinutes >= MAX_MINUTES) {
      break;
    }
  }

  // Если не набрали задач, добавляем хотя бы одну
  if (allTasks.length === 0 && selectedRooms.length > 0) {
    const firstRoom = selectedRooms[0];
    const tasks = generateTasksForRoom(firstRoom.name, 1);
    if (tasks.length > 0) {
      allTasks.push(tasks[0]);
    }
  }

  return {
    id: `checklist-${date}`,
    date,
    status: 'in_progress',
    tasks: allTasks,
    createdAt: Date.now(),
  };
}

// Форматирует дату в формат DD.MM.YY
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

// Получает дату в формате YYYY-MM-DD
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

