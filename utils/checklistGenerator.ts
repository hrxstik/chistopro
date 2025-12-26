import { Checklist, ChecklistTask } from '@/types/checklist';
import { HouseholdMember } from '@/types/household';
import { Room, UserProfile } from '@/types/profile';
import { storage } from './storage';
import { taskHistory } from './taskHistory';

// Экспортируем типы задач для использования в других модулях
export enum TaskType {
  HORIZONTAL_SURFACES_WET_CLEANING = 'HORIZONTAL_SURFACES_WET_CLEANING',
  VERTICAL_SURFACES_WET_CLEANING = 'VERTICAL_SURFACES_WET_CLEANING',
  VACUUMING = 'VACUUMING',
  FURNITURE = 'FURNITURE',
  DISHWASHING = 'DISHWASHING',
  DAILY = 'DAILY',
  LAUNDRY = 'LAUNDRY',
}

// Типы комнат
enum RoomType {
  KITCHEN = 'KITCHEN',
  BATHROOM = 'BATHROOM',
  LIVING_ROOM = 'LIVING_ROOM',
  BEDROOM = 'BEDROOM',
  OFFICE = 'OFFICE',
  DINING_ROOM = 'DINING_ROOM',
  BASEMENT = 'BASEMENT',
  GENERAL = 'GENERAL', // Общие задачи для кастомных комнат
}

// Структура задачи в банке
type TaskDefinition = {
  id: number;
  type: TaskType;
  room: RoomType;
  description: string;
  minutes: number;
};

// Банк задач (экспортируем для использования в taskHistory)
export const TASKS: TaskDefinition[] = [
  {
    id: 1,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.KITCHEN,
    description: 'Протереть столы влажной тряпкой на кухне',
    minutes: 2,
  },
  {
    id: 2,
    type: TaskType.VERTICAL_SURFACES_WET_CLEANING,
    room: RoomType.KITCHEN,
    description: 'Протереть вертикальные поверхности влажной тряпкой на кухне',
    minutes: 5,
  },
  {
    id: 3,
    type: TaskType.DISHWASHING,
    room: RoomType.KITCHEN,
    description: 'Помыть грязную посуду на кухне',
    minutes: 10,
  },
  {
    id: 4,
    type: TaskType.FURNITURE,
    room: RoomType.KITCHEN,
    description: 'Почистить раковину на кухне',
    minutes: 4,
  },
  {
    id: 5,
    type: TaskType.FURNITURE,
    room: RoomType.KITCHEN,
    description: 'Почистить микроволновку и плиту на кухне',
    minutes: 6,
  },
  {
    id: 6,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.KITCHEN,
    description: 'Помыть пол на кухне',
    minutes: 6,
  },
  {
    id: 7,
    type: TaskType.FURNITURE,
    room: RoomType.BATHROOM,
    description: 'Вымыть ванну/душевую кабинку в ванной',
    minutes: 8,
  },
  {
    id: 8,
    type: TaskType.FURNITURE,
    room: RoomType.BATHROOM,
    description: 'Почистить раковину в ванной',
    minutes: 4,
  },
  {
    id: 9,
    type: TaskType.VERTICAL_SURFACES_WET_CLEANING,
    room: RoomType.BATHROOM,
    description: 'Протереть зеркало в ванной',
    minutes: 2,
  },
  {
    id: 10,
    type: TaskType.FURNITURE,
    room: RoomType.BATHROOM,
    description: 'Почистить унитаз в ванной',
    minutes: 5,
  },
  {
    id: 11,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.BATHROOM,
    description: 'Помыть пол в ванной',
    minutes: 5,
  },
  {
    id: 12,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.LIVING_ROOM,
    description: 'Протереть столы влажной тряпкой в гостиной',
    minutes: 4,
  },
  {
    id: 13,
    type: TaskType.VACUUMING,
    room: RoomType.LIVING_ROOM,
    description: 'Пропылесосить диваны и кресла в гостиной',
    minutes: 5,
  },
  {
    id: 14,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.LIVING_ROOM,
    description: 'Помыть пол в гостиной',
    minutes: 5,
  },
  {
    id: 15,
    type: TaskType.FURNITURE,
    room: RoomType.BEDROOM,
    description: 'Поменять постельное белье в спальне',
    minutes: 5,
  },
  {
    id: 16,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.BEDROOM,
    description: 'Протереть столы влажной тряпкой в спальне',
    minutes: 4,
  },
  {
    id: 17,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.BEDROOM,
    description: 'Помыть пол в спальне',
    minutes: 6,
  },
  {
    id: 18,
    type: TaskType.FURNITURE,
    room: RoomType.OFFICE,
    description: 'Протереть рабочее место влажной тряпкой в кабинете',
    minutes: 4,
  },
  {
    id: 19,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.OFFICE,
    description: 'Помыть пол в кабинете',
    minutes: 6,
  },
  {
    id: 20,
    type: TaskType.VACUUMING,
    room: RoomType.GENERAL,
    description: 'Пропылесосить полы',
    minutes: 6,
  },
  {
    id: 21,
    type: TaskType.VERTICAL_SURFACES_WET_CLEANING,
    room: RoomType.GENERAL,
    description: 'Протереть дверные ручки и выключатели',
    minutes: 3,
  },
  {
    id: 22,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.GENERAL,
    description: 'Вымыть подоконники влажной тряпкой',
    minutes: 4,
  },
  {
    id: 23,
    type: TaskType.VERTICAL_SURFACES_WET_CLEANING,
    room: RoomType.GENERAL,
    description: 'Протереть зеркала и стеклянные поверхности',
    minutes: 3,
  },
  {
    id: 24,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.GENERAL,
    description: 'Протереть полки и шкафы',
    minutes: 5,
  },
  {
    id: 25,
    type: TaskType.VERTICAL_SURFACES_WET_CLEANING,
    room: RoomType.GENERAL,
    description: 'Помыть окна и рамы',
    minutes: 8,
  },
  {
    id: 26,
    type: TaskType.FURNITURE,
    room: RoomType.GENERAL,
    description: 'Протереть электронику',
    minutes: 3,
  },
  {
    id: 27,
    type: TaskType.DAILY,
    room: RoomType.GENERAL,
    description: 'Выбросить мусор',
    minutes: 3,
  },
  {
    id: 28,
    type: TaskType.DAILY,
    room: RoomType.GENERAL,
    description: 'Проветрить помещения',
    minutes: 2,
  },
  {
    id: 29,
    type: TaskType.DAILY,
    room: RoomType.DINING_ROOM,
    description: 'Протереть стол в обеденной',
    minutes: 4,
  },
  {
    id: 30,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.DINING_ROOM,
    description: 'Помыть пол в обеденной',
    minutes: 6,
  },
  {
    id: 31,
    type: TaskType.HORIZONTAL_SURFACES_WET_CLEANING,
    room: RoomType.BASEMENT,
    description: 'Помыть пол в подвале',
    minutes: 8,
  },
  {
    id: 32,
    type: TaskType.LAUNDRY,
    room: RoomType.GENERAL,
    description: 'Постирать и развесить одежду',
    minutes: 12,
  },
  {
    id: 33,
    type: TaskType.LAUNDRY,
    room: RoomType.GENERAL,
    description: 'Снять одежду с сушки',
    minutes: 5,
  },
  {
    id: 34,
    type: TaskType.LAUNDRY,
    room: RoomType.GENERAL,
    description: 'Погладить одежду',
    minutes: 15,
  },
  {
    id: 35,
    type: TaskType.DAILY,
    room: RoomType.GENERAL,
    description: 'Убрать детские игрушки',
    minutes: 3,
  },
];

// Маппинг названий комнат на RoomType
const ROOM_NAME_TO_TYPE: Record<string, RoomType> = {
  Кухня: RoomType.KITCHEN,
  Ванная: RoomType.BATHROOM,
  Гостиная: RoomType.LIVING_ROOM,
  Спальня: RoomType.BEDROOM,
  Кабинет: RoomType.OFFICE,
  Обеденная: RoomType.DINING_ROOM,
  Подвал: RoomType.BASEMENT,
};

// Получает задачи для конкретной комнаты
function getTasksForRoom(roomName: string, isCustom: boolean): TaskDefinition[] {
  if (isCustom) {
    // Для кастомных комнат используем общие задачи (GENERAL)
    return TASKS.filter((task) => task.room === RoomType.GENERAL);
  }

  // Для стандартных комнат находим соответствующий RoomType
  const roomType = ROOM_NAME_TO_TYPE[roomName];
  if (!roomType) {
    // Если комната не найдена, используем общие задачи
    return TASKS.filter((task) => task.room === RoomType.GENERAL);
  }

  // Возвращаем задачи для конкретной комнаты
  return TASKS.filter((task) => task.room === roomType);
}

// Форматирует описание задачи с подстановкой названия комнаты для кастомных комнат
function formatTaskDescription(description: string, roomName: string, isCustom: boolean): string {
  if (!isCustom) {
    // Для стандартных комнат описание уже содержит название комнаты в банке
    return description;
  }
  return `${description} в комнате "${roomName}"`;
}

// Определяет тип площади дома
function getHouseSizeType(area: string): 'small' | 'medium' | 'large' {
  const areaNum = parseInt(area) || 0;
  if (areaNum <= 60) return 'small';
  if (areaNum <= 200) return 'medium';
  return 'large';
}

// Вычисляет время задачи с учетом площади дома
function calculateTaskMinutes(
  task: TaskDefinition,
  houseSize: 'small' | 'medium' | 'large',
): number {
  const baseMinutes = task.minutes;

  // Умножаем время только для определенных типов задач
  if (
    task.type === TaskType.HORIZONTAL_SURFACES_WET_CLEANING ||
    task.type === TaskType.VERTICAL_SURFACES_WET_CLEANING ||
    task.type === TaskType.VACUUMING
  ) {
    if (houseSize === 'medium') {
      return Math.floor(baseMinutes * 1.5);
    } else if (houseSize === 'large') {
      return Math.floor(baseMinutes * 2);
    }
  }

  return baseMinutes;
}

// Проверяет, есть ли сожители младше 7 лет
function hasChildrenUnder7(householdMembers: HouseholdMember[]): boolean {
  return householdMembers.some((member) => {
    const age = parseInt(member.age) || 0;
    return age < 7;
  });
}

// Находит детей от 3 до 10 лет включительно
function getChildrenAged3To10(householdMembers: HouseholdMember[]): HouseholdMember[] {
  return householdMembers.filter((member) => {
    const age = parseInt(member.age) || 0;
    return age >= 3 && age <= 10;
  });
}

// Проверяет, есть ли дети до 10 лет включительно
function hasChildrenUpTo10(householdMembers: HouseholdMember[]): boolean {
  return householdMembers.some((member) => {
    const age = parseInt(member.age) || 0;
    return age <= 10;
  });
}

// Проверяет, есть ли дети младше 3 лет
function hasChildrenUnder3(householdMembers: HouseholdMember[]): boolean {
  return householdMembers.some((member) => {
    const age = parseInt(member.age) || 0;
    return age < 3;
  });
}

// Получает количество сожителей
function getHouseholdMembersCount(householdMembers: HouseholdMember[]): number {
  return householdMembers.length;
}

// Получает список участников уборки (пользователь + сожители старше 10 лет)
// Возвращает массив объектов с id, name и maxMinutes (потолок времени)
function getCleaningParticipants(
  householdMembers: HouseholdMember[],
  userProfession?: string,
): Array<{ id: string | null; name: string; maxMinutes: number }> {
  // Пользователь: работающие - 15 минут, неработающие - 20 минут
  const userMaxMinutes = isWorkingProfession(userProfession) ? 15 : 20;

  const participants: Array<{ id: string | null; name: string; maxMinutes: number }> = [
    { id: null, name: 'Вы', maxMinutes: userMaxMinutes },
  ];

  // Добавляем сожителей старше 10 лет с их потолками времени
  householdMembers.forEach((member) => {
    const age = parseInt(member.age) || 0;
    if (age > 10) {
      // Работающие сожители - 15 минут, неработающие - 20 минут
      const maxMinutes = isWorkingProfession(member.profession) ? 15 : 20;
      participants.push({ id: member.id, name: member.name, maxMinutes });
    }
  });

  return participants;
}
// Работающие профессии (15 минут потолок)
const WORKING_PROFESSIONS = [
  'Гибридный работник',
  'Уличный работник',
  'Офисный работник',
  'Удалёнщик',
];
// Неработающие профессии (20 минут потолок)
const NON_WORKING_PROFESSIONS = ['Безработный', 'Студент'];

// Проверяет, является ли профессия работающей
function isWorkingProfession(profession?: string): boolean {
  if (!profession) return false;
  return WORKING_PROFESSIONS.includes(profession);
}

// Вычисляет максимальное время для чеклиста
function calculateMaxMinutes(householdMembers: HouseholdMember[], userProfession?: string): number {
  // Пользователь: работающие - 15 минут, неработающие - 20 минут
  const baseMinutes = isWorkingProfession(userProfession) ? 15 : 20;

  const extraMinutes = householdMembers.reduce((sum, member) => {
    const age = parseInt(member.age, 10) || 0;
    if (age <= 10) return sum; // детям до 10 ничего не добавляем
    // Работающие сожители добавляют 15 минут, неработающие - 20 минут
    if (isWorkingProfession(member.profession)) return sum + 15;
    return sum + 20;
  }, 0);

  return baseMinutes + extraMinutes;
}

// Генерирует чеклист на основе комнат из профиля
export async function generateChecklist(
  rooms: Room[],
  date: string,
  profile: UserProfile | null = null,
): Promise<Checklist> {
  // Загружаем профиль если не передан
  if (!profile) {
    profile = await storage.getProfile();
  }

  if (!profile) {
    throw new Error('Profile is required for checklist generation');
  }

  // Фильтруем только выбранные комнаты
  const selectedRooms = rooms.filter((r) => r.checked);

  // Вычисляем максимальное время
  const MAX_MINUTES = calculateMaxMinutes(profile.householdMembers || [], profile.profession);
  const houseSize = getHouseSizeType(profile.area || '0');
  const hasPets = profile.hasPets || false;
  const hasChildren = hasChildrenUnder7(profile.householdMembers || []);

  // Получаем состояние генераций стирки и увеличиваем счетчик
  const { taskId: laundryTaskId, newGeneration: laundryGeneration } =
    await taskHistory.getAndIncrementLaundryGeneration();

  const allTasks: ChecklistTask[] = [];
  let totalMinutes = 0;
  const usedTaskIdsToday = new Set<number>(); // Для проверки дубликатов в один день
  const usedTaskTypesByRoom = new Map<string, Set<string>>(); // Типы задач по комнатам для проверки дубликатов

  // Правило 17: DAILY задачи в приоритете всех, ставим каждый день
  const dailyTasks = TASKS.filter((t) => t.type === TaskType.DAILY);

  // Обрабатываем задачу 35 (убрать детские игрушки) отдельно
  const task35 = TASKS.find((t) => t.id === 35);
  let task35Assigned = false;

  if (task35) {
    // Задача добавляется всегда, если есть дети до 10 лет включительно
    const hasChildren = hasChildrenUpTo10(profile.householdMembers || []);

    if (hasChildren) {
      const children3To10 = getChildrenAged3To10(profile.householdMembers || []);
      const taskMinutes = calculateTaskMinutes(task35, houseSize);
      const formattedDescription = formatTaskDescription(task35.description, 'GENERAL', false);

      // Если есть дети от 3 до 10 лет - назначаем задачу одному из них
      if (children3To10.length > 0) {
        // Выбираем случайного ребенка от 3 до 10 лет
        const randomIndex = Math.floor(Math.random() * children3To10.length);
        const assignedChild = children3To10[randomIndex];

        allTasks.push({
          id: `GENERAL-${task35.id}-${Date.now()}-${allTasks.length}`,
          title: formattedDescription,
          minutes: taskMinutes,
          status: 'in_progress',
          roomName: 'GENERAL',
          assignedTo: assignedChild.id, // Назначаем ребенку
        });
      } else {
        // Если все дети младше 3 лет - задача будет назначена взрослым при распределении
        allTasks.push({
          id: `GENERAL-${task35.id}-${Date.now()}-${allTasks.length}`,
          title: formattedDescription,
          minutes: taskMinutes,
          status: 'in_progress',
          roomName: 'GENERAL',
          // assignedTo будет установлен при распределении среди взрослых
        });
      }

      totalMinutes += taskMinutes;
      usedTaskIdsToday.add(task35.id);
      task35Assigned = true;
    }
  }

  // Добавляем остальные DAILY задачи (кроме 35, она уже обработана)
  for (const dailyTask of dailyTasks) {
    if (dailyTask.id === 35) {
      continue; // Пропускаем задачу 35, она уже обработана выше
    }

    const taskMinutes = calculateTaskMinutes(dailyTask, houseSize);

    if (totalMinutes + taskMinutes <= MAX_MINUTES) {
      // Для DAILY задач используем комнату GENERAL
      const formattedDescription = formatTaskDescription(dailyTask.description, 'GENERAL', false);

      allTasks.push({
        id: `GENERAL-${dailyTask.id}-${Date.now()}-${allTasks.length}`,
        title: formattedDescription,
        minutes: taskMinutes,
        status: 'in_progress',
        roomName: 'GENERAL',
      });

      totalMinutes += taskMinutes;
      usedTaskIdsToday.add(dailyTask.id);

      // Обновляем историю типов задач
      if (!usedTaskTypesByRoom.has('GENERAL')) {
        usedTaskTypesByRoom.set('GENERAL', new Set());
      }
      usedTaskTypesByRoom.get('GENERAL')!.add(dailyTask.type);
    }
  }

  // Правило 11: Если есть домашние животные, ставим задачу 20 каждый день
  if (hasPets) {
    const task20 = TASKS.find((t) => t.id === 20);
    if (task20 && !usedTaskIdsToday.has(20)) {
      const taskMinutes = calculateTaskMinutes(task20, houseSize);

      if (totalMinutes + taskMinutes <= MAX_MINUTES) {
        const formattedDescription = formatTaskDescription(task20.description, 'GENERAL', false);

        allTasks.push({
          id: `GENERAL-${task20.id}-${Date.now()}-${allTasks.length}`,
          title: formattedDescription,
          minutes: taskMinutes,
          status: 'in_progress',
          roomName: 'GENERAL',
        });

        totalMinutes += taskMinutes;
        usedTaskIdsToday.add(20);

        if (!usedTaskTypesByRoom.has('GENERAL')) {
          usedTaskTypesByRoom.set('GENERAL', new Set());
        }
        usedTaskTypesByRoom.get('GENERAL')!.add(task20.type);
      }
    }
  }

  // Правило 8: Обработка последовательности стирки (32 -> 33 -> 34) на основе генераций
  // Паттерн: 32, 33, 34, затем 7 пропусков (всего 10 генераций в цикле)
  if (laundryTaskId !== null) {
    const laundryTask = TASKS.find((t) => t.id === laundryTaskId);
    if (laundryTask && totalMinutes + laundryTask.minutes <= MAX_MINUTES) {
      const taskMinutes = calculateTaskMinutes(laundryTask, houseSize);
      if (totalMinutes + taskMinutes <= MAX_MINUTES) {
        const formattedDescription = formatTaskDescription(
          laundryTask.description,
          'GENERAL',
          false,
        );
        allTasks.push({
          id: `GENERAL-${laundryTask.id}-${Date.now()}-${allTasks.length}`,
          title: formattedDescription,
          minutes: taskMinutes,
          status: 'in_progress',
          roomName: 'GENERAL',
        });
        totalMinutes += taskMinutes;
        usedTaskIdsToday.add(laundryTaskId);

        if (!usedTaskTypesByRoom.has('GENERAL')) {
          usedTaskTypesByRoom.set('GENERAL', new Set());
        }
        usedTaskTypesByRoom.get('GENERAL')!.add(laundryTask.type);

        console.log(
          `Laundry task ${laundryTaskId} added (generation ${laundryGeneration.generationCount}, step ${laundryGeneration.currentLaundryStep})`,
        );
      }
    }
  }

  // Генерируем задачи для комнат
  // Перемешиваем комнаты для случайного порядка
  const shuffledRooms = [...selectedRooms].sort(() => Math.random() - 0.5);

  for (const room of shuffledRooms) {
    if (totalMinutes >= MAX_MINUTES) break;

    const roomCount = parseInt(room.count) || 1;
    const availableTasks = getTasksForRoom(room.name, room.isCustom);

    // Правило 12: Для комнат не ставим общие задачи 32, 33, 34, 35
    const filteredTasks = availableTasks.filter(
      (t) => t.id !== 32 && t.id !== 33 && t.id !== 34 && t.id !== 35,
    );

    // Правило 14: Для дефолтных комнат стараемся поставить в первую очередь задачу из пула привязанного к типу комнаты
    // Правило 13: Для собственных комнат ставим только общие задачи (уже отфильтровано в getTasksForRoom)

    // Фильтруем задачи по правилам истории (синхронные проверки)
    const validTasks = filteredTasks.filter((task) => {
      // Правило 4: В один день не может быть двух одинаковых задач для одной комнаты
      if (usedTaskIdsToday.has(task.id)) {
        return false;
      }

      // Правило 6: Нельзя давать один и тот же тип задачи в один день для комнаты
      const roomTaskTypes = usedTaskTypesByRoom.get(room.name) || new Set();
      if (roomTaskTypes.has(task.type)) {
        return false;
      }

      return true;
    });

    // Выбираем задачи для комнаты с проверкой правила 3 (асинхронно)
    const selectedTasks: TaskDefinition[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < roomCount && selectedTasks.length < roomCount; i++) {
      let attempts = 0;
      let task: TaskDefinition | null = null;
      let taskIndex = -1;

      // Ищем задачу, которая проходит все проверки
      while (attempts < validTasks.length * 2) {
        const index = Math.floor(Math.random() * validTasks.length);

        if (usedIndices.has(index)) {
          attempts++;
          continue;
        }

        const candidateTask = validTasks[index];

        // Правило 3: Не повторяем задачи 2 дня подряд для одной и той же комнаты
        // ИСКЛЮЧЕНИЕ: DAILY задачи могут повторяться каждый день
        if (candidateTask.type !== TaskType.DAILY) {
          const wasUsedYesterday = await taskHistory.wasTaskUsedYesterday(
            room.name,
            candidateTask.id,
            date,
          );
          if (wasUsedYesterday) {
            attempts++;
            continue;
          }
        }

        // Проверяем лимит времени
        const taskMinutes = calculateTaskMinutes(candidateTask, houseSize);
        if (totalMinutes + taskMinutes > MAX_MINUTES) {
          attempts++;
          continue;
        }

        // Задача подходит
        task = candidateTask;
        taskIndex = index;
        break;
      }

      if (!task || taskIndex === -1) {
        break; // Не нашли подходящую задачу
      }

      usedIndices.add(taskIndex);
      selectedTasks.push(task);
      totalMinutes += calculateTaskMinutes(task, houseSize);
      usedTaskIdsToday.add(task.id);

      if (!usedTaskTypesByRoom.has(room.name)) {
        usedTaskTypesByRoom.set(room.name, new Set());
      }
      usedTaskTypesByRoom.get(room.name)!.add(task.type);
    }

    // Добавляем выбранные задачи в чеклист
    for (const taskData of selectedTasks) {
      const formattedDescription = formatTaskDescription(
        taskData.description,
        room.name,
        room.isCustom,
      );
      const taskMinutes = calculateTaskMinutes(taskData, houseSize);

      allTasks.push({
        id: `${room.name}-${taskData.id}-${Date.now()}-${allTasks.length}`,
        title: formattedDescription,
        minutes: taskMinutes,
        status: 'in_progress',
        roomName: room.name,
      });
    }
  }

  // Правило 8: Состояние стирки уже обновлено в incrementLaundryGeneration()
  // Здесь просто логируем для отладки
  if (laundryTaskId !== null) {
    console.log(
      `Laundry cycle: generation ${laundryGeneration.generationCount}, step ${laundryGeneration.currentLaundryStep}, task ${laundryTaskId}`,
    );
  } else {
    console.log(
      `Laundry cycle: generation ${laundryGeneration.generationCount}, step ${laundryGeneration.currentLaundryStep}, no laundry task`,
    );
  }

  // Распределяем задачи между участниками уборки поровну по времени с учетом потолков
  const participants = getCleaningParticipants(profile.householdMembers || [], profile.profession);

  // Отслеживаем суммарное время для каждого участника
  const participantTime = new Map<string | null, number>();
  participants.forEach((p) => {
    participantTime.set(p.id, 0);
  });

  // Сначала учитываем уже назначенные задачи (например, задача 35 для детей 3-6)
  allTasks.forEach((task) => {
    if (task.assignedTo !== undefined) {
      const currentTime = participantTime.get(task.assignedTo) || 0;
      participantTime.set(task.assignedTo, currentTime + task.minutes);
    }
  });

  // Если есть участники (больше одного), распределяем не назначенные задачи по времени
  if (participants.length > 1 && allTasks.length > 0) {
    // Фильтруем задачи, которые еще не назначены
    const unassignedTasks = allTasks.filter((task) => task.assignedTo === undefined);

    // Сортируем задачи по времени (от больших к меньшим) для лучшего распределения
    const sortedTasks = [...unassignedTasks].sort((a, b) => b.minutes - a.minutes);

    // Распределяем задачи: всегда даем задачу участнику с наименьшим текущим временем,
    // но учитываем потолок времени каждого участника
    sortedTasks.forEach((task) => {
      // Находим участника с минимальным временем, у которого есть место для задачи
      let minTime = Infinity;
      let assignedParticipantId: string | null = null;

      participants.forEach((participant) => {
        const currentTime = participantTime.get(participant.id) || 0;
        const maxMinutes = participant.maxMinutes;

        // Проверяем, что задача поместится в потолок участника
        if (currentTime + task.minutes <= maxMinutes) {
          if (currentTime < minTime) {
            minTime = currentTime;
            assignedParticipantId = participant.id;
          }
        }
      });

      // Если не нашли участника с достаточным местом, берем того, у кого меньше всего времени
      // (даже если превысим потолок - лучше распределить равномерно)
      if (assignedParticipantId === null) {
        minTime = Infinity;
        participants.forEach((participant) => {
          const currentTime = participantTime.get(participant.id) || 0;
          if (currentTime < minTime) {
            minTime = currentTime;
            assignedParticipantId = participant.id;
          }
        });
      }

      // Назначаем задачу этому участнику (всегда должен быть найден, так как есть хотя бы пользователь)
      if (assignedParticipantId !== null) {
        task.assignedTo = assignedParticipantId;
        const finalTime = participantTime.get(assignedParticipantId) || 0;
        participantTime.set(assignedParticipantId, finalTime + task.minutes);
      } else {
        // Fallback: если по какой-то причине не нашли участника, назначаем пользователю
        task.assignedTo = null;
        const userTime = participantTime.get(null) || 0;
        participantTime.set(null, userTime + task.minutes);
      }
    });
  } else {
    // Если участник один (только пользователь), все не назначенные задачи ему
    allTasks.forEach((task) => {
      if (task.assignedTo === undefined) {
        task.assignedTo = null; // null означает пользователя
      }
    });
  }

  // Создаем чеклист с уникальным ID на основе timestamp и случайного числа
  const now = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const checklist: Checklist = {
    id: `checklist-${date}-${now}-${randomSuffix}`,
    date,
    status: 'in_progress',
    tasks: allTasks,
    createdAt: now,
  };

  // Обновляем историю задач после генерации
  await taskHistory.updateHistoryFromChecklist(checklist);

  return checklist;
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
