// app/(tabs)/settings.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BackButton } from '@/components/BackButton';
import { Checkbox } from '@/components/Checkbox';
import { InputField } from '@/components/InputField';
import { RadioButton } from '@/components/RadioButton';
import { SelectField } from '@/components/SelectField';
import { Colors } from '@/constants/colors';

import ArrowDown from '@/assets/icons/arrowdown.svg';

// аватары профиля
import Profile1 from '@/assets/icons/profiles/profile.svg';
import Profile2 from '@/assets/icons/profiles/profile2.svg';
import Profile3 from '@/assets/icons/profiles/profile3.svg';
import Profile4 from '@/assets/icons/profiles/profile4.svg';
import Profile5 from '@/assets/icons/profiles/profile5.svg';
import Profile6 from '@/assets/icons/profiles/profile6.svg';

// домочадцы
import HouseholdCard from '@/components/HouseholdCard';
import { HouseholdMember } from '@/types/household';

type Gender = 'male' | 'female' | null;

type Room = {
  id: string;
  name: string;
  count: string;
  checked: boolean;
  isCustom: boolean;
};

const DEFAULT_ROOMS: Room[] = [
  { id: '1', name: 'Спальня',        count: '1', checked: true,  isCustom: false },
  { id: '2', name: 'Кухня',          count: '1', checked: true,  isCustom: false },
  { id: '3', name: 'Ванная',         count: '1', checked: true,  isCustom: false },
  { id: '4', name: 'Кабинет',        count: '0', checked: false, isCustom: false },
  { id: '5', name: 'Гостиная',       count: '1', checked: true,  isCustom: false },
  { id: '6', name: 'Обеденная',      count: '0', checked: false, isCustom: false },
  { id: '7', name: 'Подвал',         count: '0', checked: false, isCustom: false },
  { id: '8', name: 'Тренажёрный зал', count: '1', checked: true, isCustom: true },
];

// чуть-чуть демо для домочадцев
const DEFAULT_MEMBERS: HouseholdMember[] = [
  {
    id: 'h1',
    name: 'Ирина',
    age: '23',
    gender: 'female',
    profession: 'Студент',
    expanded: false,
  },
  {
    id: 'h2',
    name: 'Сергей',
    age: '30',
    gender: 'male',
    profession: 'Офисный работник',
    expanded: false,
  },
];

// утилита для числовых полей
const clampNumeric = (text: string, min?: number, max?: number) => {
  const digits = text.replace(/\D/g, '');
  if (digits === '') return '';
  let num = parseInt(digits, 10);
  if (!isNaN(num)) {
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
  }
  return String(num);
};

const TIMEZONES = [
  'Москва (GMT +3)',
  'Калининград (GMT +2)',
  'Самара (GMT +4)',
  'Екатеринбург (GMT +5)',
];

const PROFESSIONS = [
  'Безработный',
  'Студент',
  'Удалёнщик',
  'Офисный работник',
  'Гибридный работник',
  'Уличный работник',
];

const AVATAR_COMPONENTS = [Profile1, Profile2, Profile3, Profile4, Profile5, Profile6];

export default function SettingsScreen() {
  const router = useRouter();

  // аватар — индекс выбранного SVG
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  // личная информация
  const [name, setName] = useState('Ирина');
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState('23');
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [profession, setProfession] = useState(PROFESSIONS[1]); // Студент

  // дом
  const [area, setArea] = useState('63');
  const [petsCount, setPetsCount] = useState('0');
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);

  // домочадцы
  const [members, setMembers] = useState<HouseholdMember[]>(DEFAULT_MEMBERS);

  // сворачиваемые блоки
  const [personalOpen, setPersonalOpen] = useState(true);
  const [homeOpen, setHomeOpen] = useState(true);
  const [householdOpen, setHouseholdOpen] = useState(true);

  const createId = () => Date.now().toString();

  const handleChangeAge = (text: string) => {
    setAge(clampNumeric(text, 0, 100));
  };

  const handleChangeArea = (text: string) => {
    setArea(clampNumeric(text, 1)); // минимум 1
  };

  const handleChangePets = (text: string) => {
    setPetsCount(clampNumeric(text, 0)); // минимум 0
  };

  const handleToggleRoom = (id: string) => {
    setRooms((prev) =>
      prev
        .map((room) => {
          if (room.id !== id) return room;

          if (room.isCustom && room.checked) {
            // кастомная и выключаем — удаляем
            return { ...room, checked: false, _remove: true } as any;
          }

          return { ...room, checked: !room.checked };
        })
        .filter((room: any) => !room._remove)
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
        room.id === id
          ? { ...room, count: clampNumeric(count, 0, 10) }
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
        count: '0',
        checked: true,
        isCustom: true,
      },
    ]);
  };

  // домочадцы — хэндлеры
  const updateMember = (id: string, patch: Partial<HouseholdMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, expanded: !m.expanded } : m
      )
    );
  };

  const SelectedAvatar = AVATAR_COMPONENTS[selectedAvatarIndex];

  return (
    <View style={styles.container}>
      {/* шапка */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <BackButton />
          <Text style={styles.headerTitle}>Настройки</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Аватар и выбор иконки */}
        <View style={styles.avatarBlock}>
          <View >
            <SelectedAvatar width={100} height={100} />
          </View>

          <View style={styles.avatarRow}>
            {AVATAR_COMPONENTS.map((Icon, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedAvatarIndex(index)}
                style={[
                  styles.avatarOption,
                  selectedAvatarIndex === index && styles.avatarOptionSelected,
                ]}
              >
                <Icon width={36} height={36} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Личная информация */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderBox}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setPersonalOpen((v) => !v)}
            >
              <Text style={styles.sectionTitle}>Личная информация</Text>
              <ArrowDown
                width={16}
                height={16}
                style={{
                  transform: [{ rotate: personalOpen ? '0deg' : '-90deg' }],
                }}
              />
            </Pressable>
          </View>

          {personalOpen && (
            <View style={styles.sectionBody}>
              <InputField
                label="Имя:"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Пол:</Text>
              <RadioButton
                label="Мужской"
                selected={gender === 'male'}
                onPress={() => setGender('male')}
                borderColor={Colors.primary}
              />
              <RadioButton
                label="Женский"
                selected={gender === 'female'}
                onPress={() => setGender('female')}
                borderColor={Colors.red}
              />

              <InputField
                label="Возраст:"
                value={age}
                onChangeText={handleChangeAge}
                keyboardType="numeric"
              />

              <SelectField
                label="Часовой пояс:"
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES}
              />

              <SelectField
                label="Вид профессии:"
                value={profession}
                onChange={setProfession}
                options={PROFESSIONS}
              />
            </View>
          )}
        </View>

        {/* Информация о доме */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderBox}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setHomeOpen((v) => !v)}
            >
              <Text style={styles.sectionTitle}>Информация о доме</Text>
              <ArrowDown
                width={16}
                height={16}
                style={{
                  transform: [{ rotate: homeOpen ? '0deg' : '-90deg' }],
                }}
              />
            </Pressable>
          </View>

          {homeOpen && (
            <View style={styles.sectionBody}>
              {/* Площадь дома */}
              <Text style={styles.fieldLabel}>Площадь дома:</Text>
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
              <InputField
                label="Количество домашних животных:"
                value={petsCount}
                onChangeText={handleChangePets}
                keyboardType="numeric"
              />

              {/* комнаты */}
              <View style={styles.roomsHeader}>
                <Text style={styles.fieldLabel}>Типы комнат:</Text>
                <Text style={styles.fieldLabel}>Количество:</Text>
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
                      room.isCustom && handleChangeRoomName(room.id, text)
                    }
                    editable={room.isCustom}
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

              <Pressable onPress={handleAddRoom} style={styles.addRoomButton}>
                <Text style={styles.addRoomPlus}>+</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Информация о домочадцах */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderBox}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setHouseholdOpen((v) => !v)}
            >
              <Text style={styles.sectionTitle}>Информация о домочадцах</Text>
              <ArrowDown
                width={16}
                height={16}
                style={{
                  transform: [{ rotate: householdOpen ? '0deg' : '-90deg' }],
                }}
              />
            </Pressable>
          </View>

          {householdOpen && (
            <View style={styles.sectionBody}>
              {members.map((member) => (
                <HouseholdCard
                  key={member.id}
                  member={member}
                  onChange={(patch) => updateMember(member.id, patch)}
                  onDelete={() => deleteMember(member.id)}
                  onToggle={() => toggleMember(member.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  topDivider: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },

  /* Аватар */

  avatarBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  avatarOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 1,
  },

  /* Общие стили секций */

  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderBox: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5FAFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBody: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginTop: 4,
  },

  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 8,
    paddingHorizontal: 12,
  },

  /* Площадь дома */

  areaWrapper: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 12,
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
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  roomNameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF', // и предопределённые, и кастомные — белые
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
    backgroundColor: '#FFFFFF',
  },
  addRoomButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginLeft: 12,
  },
  addRoomPlus: {
    fontSize: 24,
    color: Colors.primary,
  },
});
