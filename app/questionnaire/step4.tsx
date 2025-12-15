import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Checkbox } from '@/components/Checkbox';
import { CloudSmall } from '@/components/CloudSmall';
import { OnboardingButton } from '@/components/OnboardingButton';
import { QuestionnaireLayout } from '@/components/QuestionnaireLayout';
import { Colors } from '@/constants/colors';

type Room = {
  id: string;
  name: string;
  count: string;
  checked: boolean;
  isCustom: boolean;
};

const DEFAULT_ROOMS: Room[] = [
  { id: '1', name: 'Спальня',   count: '', checked: false, isCustom: false },
  { id: '2', name: 'Кухня',     count: '', checked: false, isCustom: false },
  { id: '3', name: 'Ванная',    count: '', checked: false, isCustom: false },
  { id: '4', name: 'Кабинет',   count: '', checked: false, isCustom: false },
  { id: '5', name: 'Гостиная',  count: '', checked: false, isCustom: false },
  { id: '6', name: 'Обеденная', count: '', checked: false, isCustom: false },
  { id: '7', name: 'Подвал',    count: '', checked: false, isCustom: false },
];

// утилита для числовых полей
const clampNumeric = (text: string, min?: number, max?: number) => {
  const digits = text.replace(/\D/g, '');
  if (digits === '') return '';
  let num = parseInt(digits, 10);
  if (min !== undefined && num < min) num = min;
  if (max !== undefined && num > max) num = max;
  return String(num);
};

export default function Step4() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);

  const [area, setArea] = useState('');
  const [petsCount, setPetsCount] = useState('');
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);

  const createId = () => Date.now().toString();

  const handleToggleRoom = (id: string) => {
    setRooms((prev) =>
      prev
        .map((room) => {
          if (room.id !== id) return room;

          // если это кастомная комната и мы снимаем галочку — пометим на удаление
          if (room.isCustom && room.checked) {
            return { ...room, checked: false, _remove: true } as any;
          }

          return { ...room, checked: !room.checked };
        })
        // удаляем кастомные комнаты, у которых сняли галочку
        .filter((room: any) => !room._remove)
    );
  };

  const handleChangeRoomName = (id: string, name: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        // на всякий случай не трогаем предустановленные
        room.id === id && room.isCustom ? { ...room, name } : room
      )
    );
  };

  const handleChangeRoomCount = (id: string, count: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? { ...room, count: clampNumeric(count, 1, 10) }
          : room
      )
    );
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        id: createId(),
        name: '',
        count: '',
        checked: true,
        isCustom: true,
      },
    ]);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleChangeArea = (text: string) => {
    setArea(clampNumeric(text, 1)); // минимум 1
  };

  const handleChangePets = (text: string) => {
    setPetsCount(clampNumeric(text, 0)); // минимум 0
  };

  // хотя бы одна выбранная комната
  const hasSelectedRoom = rooms.some((r) => r.checked);

  // у всех выбранных комнат есть название
  const allSelectedHaveName = rooms.every(
    (r) => !r.checked || r.name.trim() !== ''
  );

  // у всех выбранных комнат валидное количество 1–10
  const allSelectedHaveValidCount = rooms.every((r) => {
    if (!r.checked) return true;
    if (r.count.trim() === '') return false;
    const n = parseInt(r.count, 10);
    return !isNaN(n) && n >= 1 && n <= 10;
  });

  const isValid =
    area.trim() !== '' &&
    petsCount.trim() !== '' &&
    hasSelectedRoom &&
    allSelectedHaveName &&
    allSelectedHaveValidCount;

  return (
    <QuestionnaireLayout
      showBack
      header={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Image
            source={require('@/assets/images/chubrik1_dirty1.png')}
            style={{ width: 121, height: 181 }}
          />
          <CloudSmall text={'Расскажите\nнемного о своём доме'} />
        </View>
      }
      footer={
        <OnboardingButton
          title="Завершить"
          disabled={!isValid}
          onPress={() => {
            router.push('/questionnaire/notifications');
          }}
        />
      }
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >
        {/* Площадь дома */}
        <Text style={styles.label}>Площадь дома:</Text>
        <View style={styles.areaWrapper}>
          <TextInput
            style={styles.areaInput}
            value={area}
            onChangeText={handleChangeArea}
            keyboardType="numeric"
          />
          <Text style={styles.areaSuffix}>м²</Text>
        </View>

        {/* Кол-во животных */}
        <Text style={styles.label}>Количество домашних животных:</Text>
        <TextInput
          style={styles.input}
          value={petsCount}
          onChangeText={handleChangePets}
          keyboardType="numeric"
        />

        {/* Типы комнат */}
        <View style={styles.roomsHeader}>
          <Text style={styles.label}>Типы комнат:</Text>
          <Text style={styles.label}>Количество:</Text>
        </View>

        {rooms.map((room) => (
          <View key={room.id} style={styles.roomRow}>
            <Checkbox
              checked={room.checked}
              onToggle={() => handleToggleRoom(room.id)}
            />

            {room.isCustom ? (
              // редактируемое поле для кастомных комнат
              <TextInput
                style={styles.roomNameInput}
                value={room.name}
                onChangeText={(text) =>
                  handleChangeRoomName(room.id, text)
                }
                placeholder="Название комнаты"
              />
            ) : (
              // нередактируемое "поле" для предустановленных
              <View style={[styles.roomNameInput, styles.roomNameStatic]}>
                <Text style={styles.roomNameText}>{room.name}</Text>
              </View>
            )}

            <TextInput
              style={styles.roomCountInput}
              value={room.count}
              onChangeText={(text) =>
                handleChangeRoomCount(room.id, text)
              }
              keyboardType="numeric"
            />
          </View>
        ))}

        {/* Кнопка добавить комнату */}
        <Pressable onPress={handleAddRoom} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </ScrollView>
    </QuestionnaireLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },

  /* Площадь дома с "м²" внутри поля */

  areaWrapper: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  areaInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  areaSuffix: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
  },

  /* Комнаты */

  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
    marginTop: 8,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomNameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  // внешний вид "замороженного" поля для предустановленных комнат
  roomNameStatic: {
    justifyContent: 'center',
  },
  roomNameText: {
    fontSize: 14,
  },
  roomCountInput: {
    width: 64,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: Colors.primary,
  },
});
