import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { storage } from '@/utils/storage';
import { scheduleDailyNotification, cancelDailyNotification } from '@/utils/notifications';

// In your screen file or _layout.tsx
export const unstable_settings = {
  anchor: '(tabs)',
};
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'Nexa': require('../assets/fonts/Nexa-ExtraBold.otf'),
    'Nexa-Reg': require('../assets/fonts/Nexa-Regular.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Отслеживание выхода из приложения и планирование уведомлений
  useEffect(() => {
    // Обновляем timestamp последнего визита при открытии приложения
    const updateLastVisit = async () => {
      await storage.setLastVisitTimestamp(Date.now());
    };
    updateLastVisit();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // При возврате в приложение обновляем timestamp последнего визита
        await storage.setLastVisitTimestamp(Date.now());
      }
      // Убрали планирование уведомлений при выходе из приложения
      // Теперь уведомления планируются только при включении в настройках
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Инициализация: отменяем уведомления если они отключены
    const initNotifications = async () => {
      try {
        const profile = await storage.getProfile();
        if (!profile?.notificationsEnabled) {
          await cancelDailyNotification();
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initNotifications();

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
