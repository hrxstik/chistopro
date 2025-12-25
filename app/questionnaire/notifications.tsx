import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingCloud } from '@/components/OnboardingCloud';
import { QuestionnaireLayout } from '@/components/QuestionnaireLayout';
import { Colors } from '@/constants/colors';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { UserProfile } from '@/types/profile';
import {
  cancelDailyNotification,
  requestNotificationPermissions,
  scheduleDailyNotification,
} from '@/utils/notifications';
import { storage } from '@/utils/storage';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, reset } = useQuestionnaire();

  const saveProfile = async (notificationsEnabled: boolean) => {
    try {
      const profile: UserProfile = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        profession: data.profession,
        householdMembers: data.householdMembers,
        area: data.area,
        hasPets: data.hasPets,
        rooms: data.rooms,
        notificationsEnabled,
        tasksDone: 0,
        checklistRecord: 0,
        achievements: 0,
        chubriks: 0,
        chubrikProgress: 0,
        chubrikMaxLevel: 1,
        avatarIndex: 0,
      };

      await storage.saveProfile(profile);

      // Настраиваем или отменяем уведомления в зависимости от выбора пользователя
      if (notificationsEnabled) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          // Планируем уведомление через час после генерации чеклиста
          // Игнорируем время когда уведомления были включены
          await scheduleDailyNotification();
        }
      } else {
        await cancelDailyNotification();
      }

      reset(); // Очищаем контекст после сохранения
      router.push('/tabs');
    } catch (error) {
      console.error('Error saving profile:', error);
      // В случае ошибки все равно переходим на главный экран
      router.push('/tabs');
    }
  };

  const handleAllow = () => {
    saveProfile(true);
  };

  const handleDeny = () => {
    saveProfile(false);
  };

  return (
    <QuestionnaireLayout
      showBack
      header={
        <View style={styles.header}>
          <OnboardingCloud text={'Рад знакомству!\nПозволь мне\nнапоминать тебе об уборке'} />
        </View>
      }
      footer={null}>
      <View style={styles.content}>
        <View style={styles.mascotWrapper}>
          <Image source={require('@/assets/images/chubrik1_dirty1.png')} style={styles.mascot} />

          {/* карточка, перекрывающая нижнюю часть чубрика */}
          <View style={styles.card}>
            <Text style={styles.questionText}>
              Разрешить <Text style={styles.appName}>ЧистоПро</Text> отправлять вам уведомления?
            </Text>

            <View style={styles.buttons}>
              <Pressable style={styles.allowButton} onPress={handleAllow}>
                <Text style={styles.allowText}>Разрешить</Text>
              </Pressable>

              <Pressable style={styles.denyButton} onPress={handleDeny}>
                <Text style={styles.denyText}>Запретить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </QuestionnaireLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1, // растягиваем хедер на всю ширину
    alignItems: 'center', // и уже внутри центрируем облако
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mascotWrapper: {
    alignItems: 'center',
    marginTop: -20, // поднимаем маскота и карточку чуть выше
  },
  mascot: {
    width: 237,
    height: 356,
  },
  card: {
    marginTop: -140, // перекрываем нижнюю часть чубрика
    width: '85%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Nexa',
    textAlign: 'center',
    marginBottom: 16,
  },
  appName: {
    fontWeight: '700',
  },
  buttons: {
    gap: 8,
    alignItems: 'center',
  },
  allowButton: {
    width: '70%',
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  allowText: {
    fontSize: 20,
    fontFamily: 'Nexa',
    fontWeight: '600',
    color: Colors.primary,
  },
  denyButton: {
    width: '70%',
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyText: {
    fontSize: 20,
    fontFamily: 'Nexa',
    fontWeight: '600',
    color: Colors.disabled,
  },
});
