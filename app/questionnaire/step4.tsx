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
};

const DEFAULT_ROOMS: Room[] = [
  { id: '1', name: 'Спальня', count: '', checked: false },
  { id: '2', name: 'Кухня', count: '', checked: false },
  { id: '3', name: 'Ванная', count: '', checked: false },
  { id: '4', name: 'Кабинет', count: '', checked: false },
  { id: '5', name: 'Гостиная', count: '', checked: false },
  { id: '6', name: 'Обеденная', count: '', checked: false },
  { id: '7', name: 'Подвал', count: '', checked: false },
];

export default function Step4() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);

  const [area, setArea] = useState('');
  const [petsCount, setPetsCount] = useState('');
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);

  const createId = () => Date.now().toString();

  const handleToggleRoom = (id: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, checked: !room.checked } : room
      )
    );
  };

  const handleChangeRoomName = (id: string, name: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, name } : room
      )
    );
  };

  const handleChangeRoomCount = (id: string, count: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, count } : room
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
      },
    ]);

    // скроллим чуть вниз к добавленной комнате при желании
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const hasSelectedRoom = rooms.some((r) => r.checked);

  const isValid =
    area.trim() !== '' &&
    petsCount.trim() !== '' &&
    hasSelectedRoom;

  return (
    <QuestionnaireLayout
      showBack
      header={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Image
            source={require('@/assets/images/chubrik1_dirty1.png')}
            style={{ width: 121, height: 181 }}
          />
          <CloudSmall text={"Расскажите\nнемного о своём доме"} />
        </View>
      }
      footer={
        <OnboardingButton
          title="Завершить"
          disabled={!isValid}
          onPress={() => {
            // TODO: сохранить данные и перейти дальше
            router.push('/questionnaire/step4');
          }}
        />
      }
    >
      {/* ОДИН ScrollView на всю форму */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Площадь дома */}
        <Text style={styles.label}>Площадь дома:</Text>
        <View style={styles.areaWrapper}>
          <TextInput
            style={styles.areaInput}
            value={area}
            onChangeText={setArea}
            keyboardType="numeric"
          />
          <Text style={styles.areaSuffix}>м²</Text>
        </View>

        {/* Кол-во животных */}
        <Text style={styles.label}>Количество домашних животных:</Text>
        <TextInput
          style={styles.input}
          value={petsCount}
          onChangeText={setPetsCount}
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

            <TextInput
              style={styles.roomNameInput}
              value={room.name}
              onChangeText={(text) =>
                handleChangeRoomName(room.id, text)
              }
              placeholder="Название комнаты"
            />

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
        <Pressable
          onPress={handleAddRoom}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </ScrollView>
    </QuestionnaireLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
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
    color: Colors.primary, // тот же голубой
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
  roomCountInput: {
    width: 64,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    marginLeft: 8,
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
