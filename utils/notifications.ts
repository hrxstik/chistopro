import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { checklistStorage } from './checklistStorage';
import { storage } from './storage';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Если это отложенное уведомление, сохраняем timestamp отправки
    const identifier = notification.request.identifier;
    if (identifier === DELAYED_NOTIFICATION_IDENTIFIER) {
      await storage.setLastNotificationTimestamp(Date.now());
      await storage.setLastNotificationDate(getTodayDateString());
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const NOTIFICATION_IDENTIFIER = 'daily-checklist-reminder';
const DELAYED_NOTIFICATION_IDENTIFIER = 'delayed-checklist-reminder';

// Получает текущую дату в формате YYYY-MM-DD
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Запрашивает разрешение на уведомления
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission for notifications not granted!');
      return false;
    }

    // Для Android нужно также настроить канал
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Планирует уведомление через час после генерации чеклиста (1 раз в 24 часа)
export async function scheduleDailyNotification(): Promise<void> {
  try {
    // Отменяем предыдущие уведомления, если они есть
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
    await Notifications.cancelScheduledNotificationAsync(DELAYED_NOTIFICATION_IDENTIFIER);

    // Проверяем разрешения
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification: no permission');
      return;
    }

    // Проверяем, прошло ли 24 часа с последнего уведомления
    const lastNotificationTimestamp = await storage.getLastNotificationTimestamp();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

    if (lastNotificationTimestamp && now - lastNotificationTimestamp < TWENTY_FOUR_HOURS) {
      console.log('Less than 24 hours since last notification, skipping');
      return;
    }

    // Проверяем, выполнен ли последний чеклист (все задания выполнены)
    const lastChecklist = await checklistStorage.getLastChecklist();
    if (lastChecklist && lastChecklist.status === 'done') {
      // Если все задания выполнены, не отправляем уведомление и обновляем timestamp
      // чтобы не отправлять в ближайшие 24 часа
      console.log('Last checklist is completed, skipping notification for 24 hours');
      await storage.setLastNotificationTimestamp(now);
      return;
    }

    // Проверяем, сколько дней прошло с последнего визита пользователя
    const daysSinceLastVisit = await storage.getDaysSinceLastVisit();
    const MAX_MISSED_DAYS = 3; // Максимум 3 дня пропуска
    
    if (daysSinceLastVisit > MAX_MISSED_DAYS) {
      // Если пользователь не заходил более 3 дней, не отправляем уведомления
      console.log(`User hasn't visited for ${daysSinceLastVisit} days (more than ${MAX_MISSED_DAYS}), skipping notification`);
      return;
    }

    // Планируем уведомление через час после генерации последнего чеклиста
    // Игнорируем время когда уведомления были включены
    const oneHourInSeconds = 3600;
    let delaySeconds = oneHourInSeconds;

    if (lastChecklist) {
      // Вычисляем время с момента генерации чеклиста
      const timeSinceGeneration = Math.floor((now - lastChecklist.createdAt) / 1000);
      delaySeconds = Math.max(1, oneHourInSeconds - timeSinceGeneration);
      
      if (delaySeconds <= 0) {
        // Если уже прошло больше часа с генерации, отправляем сразу
        delaySeconds = 1;
      }
    }

    await Notifications.scheduleNotificationAsync({
      identifier: DELAYED_NOTIFICATION_IDENTIFIER,
      content: {
        title: 'Новые задания готовы! 🧹',
        body: 'Проверьте свой чек-лист на сегодня',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
      },
    });

    console.log(`Notification scheduled for ${delaySeconds} seconds (1 hour after checklist generation)`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Отменяет уведомление
export async function cancelDailyNotification(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
    await Notifications.cancelScheduledNotificationAsync(DELAYED_NOTIFICATION_IDENTIFIER);
    console.log('Notification cancelled');
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

// Проверяет, запланировано ли уведомление
export async function isNotificationScheduled(): Promise<boolean> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.some(
      (n) =>
        n.identifier === NOTIFICATION_IDENTIFIER ||
        n.identifier === DELAYED_NOTIFICATION_IDENTIFIER,
    );
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
    return false;
  }
}

// Получает статус разрешений
export async function getNotificationPermissionsStatus(): Promise<Notifications.PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting notification permissions:', error);
    return Notifications.PermissionStatus.UNDETERMINED;
  }
}

// Отправляет тестовое уведомление без задержки с тем же текстом что обычные
export async function sendTestNotification(): Promise<void> {
  try {
    // Проверяем разрешения
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot send test notification: no permission');
      return;
    }

    // Для мгновенного уведомления используем минимальную задержку (1 секунда)
    // так как seconds: 0 может не работать на некоторых платформах
    await Notifications.scheduleNotificationAsync({
      identifier: `test-${Date.now()}`,
      content: {
        title: 'Новые задания готовы! 🧹',
        body: 'Проверьте свой чек-лист на сегодня',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1, // Минимальная задержка для мгновенного уведомления
        repeats: false,
      },
    });

    console.log('Test notification sent immediately');
  } catch (error) {
    console.error('Error sending test notification:', error);
    // Если не удалось запланировать, пробуем отправить напрямую
    try {
      await Notifications.presentNotificationAsync({
        title: 'Новые задания готовы! 🧹',
        body: 'Проверьте свой чек-лист на сегодня',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      });
      console.log('Test notification sent via presentNotificationAsync');
    } catch (presentError) {
      console.error('Error presenting notification:', presentError);
    }
  }
}
