// app/(tabs)/settings.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ArrowDown from '@/assets/icons/arrowdown.svg';
import { Checkbox } from '@/components/Checkbox';
import { InputField } from '@/components/InputField';
import { RadioButton } from '@/components/RadioButton';
import { SelectField } from '@/components/SelectField';
import { Colors } from '@/constants/colors';

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
  { id: '1', name: 'Спальня', count: '1', checked: true, isCustom: false },
  { id: '2', name: 'Кухня', count: '1', checked: true, isCustom: false },
  { id: '3', name: 'Ванная', count: '1', checked: true, isCustom: false },
  { id: '4', name: 'Кабинет', count: '0', checked: false, isCustom: false },
  { id: '5', name: 'Гостиная', count: '1', checked: true, isCustom: false },
  { id: '6', name: 'Обеденная', count: '0', checked: false, isCustom: false },
  { id: '7', name: 'Подвал', count: '0', checked: false, isCustom: false },
  { id: '8', name: 'Тренажёрный зал', count: '1', checked: true, isCustom: true },
];

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

  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  // личная информация
  const [name, setName] = useState('Ирина');
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState('23');
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [profession, setProfession] = useState(PROFESSIONS[1]);

  // дом
  const [area, setArea] = useState('63');
  const [petsCount, setPetsCount] = useState('0');
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);

  // домочадцы
  const [members, setMembers] = useState<HouseholdMember[]>(DEFAULT_MEMBERS);
  const isMemberComplete = (m: HouseholdMember) =>
    m.gender !== null && m.age.trim() !== '' && m.profession !== '';

  const canAddMember = members.length === 0 || members.every(isMemberComplete);

  // по умолчанию всё свернуто
  const [personalOpen, setPersonalOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);

  const createId = () => Date.now().toString();

  const handleChangeAge = (text: string) => setAge(clampNumeric(text, 0, 100));
  const handleChangeArea = (text: string) => setArea(clampNumeric(text, 1));
  const handleChangePets = (text: string) => setPetsCount(clampNumeric(text, 0));

  const handleToggleRoom = (id: string) => {
    setRooms((prev) =>
      prev
        .map((room) => {
          if (room.id !== id) return room;

          if (room.isCustom && room.checked) {
            return { ...room, checked: false, _remove: true } as any;
          }

          return { ...room, checked: !room.checked };
        })
        .filter((room: any) => !room._remove)
    );
  };

  const handleChangeRoomName = (id: string, roomName: string) => {
    setRooms((prev) => prev.map((room) => (room.id === id ? { ...room, name: roomName } : room)));
  };

  const handleChangeRoomCount = (id: string, count: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, count: clampNumeric(count, 0, 10) } : room
      )
    );
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      { id: createId(), name: '', count: '0', checked: true, isCustom: true },
    ]);
  };

  const updateMember = (id: string, patch: Partial<HouseholdMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  // ✅ FIX: удобная функция "свернуть всех"
  const collapseAllMembers = useCallback(() => {
    setMembers((prev) => prev.map((m) => ({ ...m, expanded: false })));
  }, []);
  const collapseAllSections = useCallback(() => {
  setPersonalOpen(false);
  setHomeOpen(false);
  setHouseholdOpen(false);
  // на всякий случай — домочадцев тоже внутрь
  collapseAllMembers();
}, [collapseAllMembers]);

  // ✅ FIX 1: при открытии одного домочадца — остальные сворачиваются
  const toggleMember = (id: string) => {
    setMembers((prev) => {
      const target = prev.find((m) => m.id === id);
      const nextExpanded = !(target?.expanded ?? false);

      return prev.map((m) => {
        if (m.id === id) return { ...m, expanded: nextExpanded };
        return { ...m, expanded: false };
      });
    });
  };

  // ✅ при добавлении — новый открыт, остальные закрыты
  const handleAddMember = () => {
    if (!canAddMember) return;

    setMembers((prev) => [
      ...prev.map((m) => ({ ...m, expanded: false })),
      {
        id: createId(),
        name: `Домочадец ${prev.length + 1}`,
        age: '',
        gender: null,
        profession: '',
        expanded: true,
      } as HouseholdMember,
    ]);
  };


  // ✅ FIX 2a: если секция "домочадцы" закрывается — свернуть всех внутри
  useEffect(() => {
    if (!householdOpen) collapseAllMembers();
  }, [householdOpen, collapseAllMembers]);

  // ✅ FIX 2b: при уходе с экрана (переход в другое окно) — свернуть всех
useFocusEffect(
  useCallback(() => {
    return () => {
      collapseAllSections(); // ✅ при уходе с экрана: закрыть все 3 секции + домочадцев
    };
  }, [collapseAllSections])
);


  const SelectedAvatar = AVATAR_COMPONENTS[selectedAvatarIndex];

  const renderSectionHeader = (
    title: string,
    open: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.sectionHeaderWrap}>
  
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ArrowDown
          width={16}
          height={16}
          style={{ transform: [{ rotate: open ? '0deg' : '-90deg' }] }}
        />
      </Pressable>
      <View style={styles.sectionDivider} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* шапка */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
  <Text style={styles.headerTitle}>Настройки</Text>
</View>

      </View>


      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Аватар */}
        <View style={styles.avatarBlock}>
          <View>
            <SelectedAvatar width={100} height={100} />
          </View>

          <View style={styles.avatarRowOffset} />

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
          {renderSectionHeader('Личная информация', personalOpen, () =>
            setPersonalOpen((v) => !v)
          )}

          {personalOpen && (
            <View style={styles.sectionBody}>
              <InputField label="Имя:" value={name} onChangeText={setName} />

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
          {renderSectionHeader('Информация о доме', homeOpen, () => setHomeOpen((v) => !v))}

          {homeOpen && (
            <View style={styles.sectionBody}>
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

              <InputField
                label="Количество домашних животных:"
                value={petsCount}
                onChangeText={handleChangePets}
                keyboardType="numeric"
              />

              <View style={styles.roomsHeader}>
                <Text style={styles.fieldLabelNoPad}>Типы комнат:</Text>
                <Text style={styles.fieldLabelNoPad}>Количество:</Text>
              </View>

              {rooms.map((room) => (
                <View key={room.id} style={styles.roomRow}>
                  <Checkbox checked={room.checked} onToggle={() => handleToggleRoom(room.id)} />

                  <TextInput
                    style={styles.roomNameInput}
                    value={room.name}
                    onChangeText={(text) => room.isCustom && handleChangeRoomName(room.id, text)}
                    editable={room.isCustom}
                    placeholder="Название комнаты"
                  />

                  <TextInput
                    style={styles.roomCountInput}
                    value={room.count}
                    onChangeText={(text) => handleChangeRoomCount(room.id, text)}
                    keyboardType="numeric"
                  />
                </View>
              ))}

              <Pressable onPress={handleAddRoom} style={styles.addButton}>
                <Text style={styles.addPlus}>+</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Информация о домочадцах */}
        <View style={styles.sectionContainer}>
          {renderSectionHeader('Информация о домочадцах', householdOpen, () =>
            setHouseholdOpen((v) => !v)
          )}

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

              <Pressable
                onPress={canAddMember ? handleAddMember : undefined}
                style={[styles.addButton, { opacity: canAddMember ? 1 : 0.4 }]}
              >
                <Text style={styles.addPlus}>+</Text>
              </Pressable>

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
  paddingTop: 48, // было 40
  paddingHorizontal: 16,
  paddingBottom: 12, // было 8
  backgroundColor: Colors.background,
},
headerTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
},
headerTitle: {
  fontSize: 20,
  fontFamily: 'Nexa',
  textAlign: 'center',
  marginTop: 16,
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
  },
  avatarRowOffset: {
    height: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  avatarOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 1,
  },

  sectionContainer: {
    marginBottom: 16,
  },

  sectionHeaderWrap: {
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nexa',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.8,
    width: '95%',
    alignSelf: 'center',
    marginTop: 5,
  },

  sectionBody: {
    marginTop: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  fieldLabel: {
    fontSize: 15,
    fontFamily: 'Nexa',
    marginBottom: 6,
    marginTop: 2,
    paddingHorizontal: 0,
  },
  fieldLabelNoPad: {
    fontSize: 15,
    fontFamily: 'Nexa',
  },

  areaWrapper: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  areaInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
    paddingVertical: 0,
  },
  areaSuffix: {
    marginLeft: 8,
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
    color: Colors.primary,
  },

  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
    marginBottom: 4,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  roomNameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    marginLeft: 8,
    fontFamily: 'Nexa-Reg',
    backgroundColor: Colors.white,
  },
  roomCountInput: {
    width: 64,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'Nexa-Reg',
    marginLeft: 8,
    backgroundColor: Colors.white,
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
    marginTop: 8,
    backgroundColor: Colors.white,
  },
  addPlus: {
    fontSize: 24,
    color: Colors.primary,
  },
});
