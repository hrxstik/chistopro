// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import MainIcon from '@/assets/icons/main.svg';
import MainPressedIcon from '@/assets/icons/main_pressed.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import ProfilePressedIcon from '@/assets/icons/profile_pressed.svg';
import SettingsIcon from '@/assets/icons/settings.svg';
import SettingsPressedIcon from '@/assets/icons/settings_pressed.svg';
import { Colors } from '@/constants/colors';

export default function TabsLayout() {
  return (
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: styles.tabBar,
  }}
>


      {/* Профиль слева */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <ProfilePressedIcon width={28} height={28} />
            ) : (
              <ProfileIcon width={28} height={28} />
            ),
        }}
      />

      {/* Главная по центру */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MainPressedIcon width={28} height={28} />
            ) : (
              <MainIcon width={28} height={28} />
            ),
        }}
      />

      {/* Настройки справа */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <SettingsPressedIcon width={28} height={28} />
            ) : (
              <SettingsIcon width={28} height={28} />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.primary,
    borderTopWidth: 1,
    height: 84,        // ещё выше
    paddingBottom: 18, // побольше отступ от нижнего края
    paddingTop: 10,
  },
});

