// app/(tabs)/settings.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  { id: '4', name: 'Кабинет', count: '', checked: false, isCustom: false },
  { id: '5', name: 'Гостиная', count: '1', checked: true, isCustom: false },
  { id: '6', name: 'Обеденная', count: '', checked: false, isCustom: false },
  { id: '7', name: 'Подвал', count: '', checked: false, isCustom: false },
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

const TIMEZONES = ['Москва (GMT +3)', 'Калининград (GMT +2)', 'Самара (GMT +4)', 'Екатеринбург (GMT +5)'];

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
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // ---- keyboard listeners (без лишних паддингов снизу) ----
  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const showSub = Keyboard.addListener(showEvent, (e: any) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ скролл до активного инпута, если он попал под клавиатуру
  const scrollToFocused = useCallback(
    (targetNode: number | null) => {
      const scroll = scrollRef.current;
      if (!scroll || !targetNode) return;

      const scrollNode = findNodeHandle(scroll);
      if (!scrollNode) return;

      // Рабочая зона по высоте: экран минус клавиатура
      // (KAV уже "съедает" место под клавиатуру, но на практике на iOS/Android
      // иногда всё равно нужно подскроллить, особенно когда фокус внутри длинного ScrollView)
      const windowH = (global as any)?.window?.innerHeight; // может быть undefined
      const fallbackH = 800;
      const screenHeight =
        typeof windowH === 'number' && windowH > 0 ? windowH : fallbackH;

      const visibleBottomY = screenHeight - (keyboardVisible ? keyboardHeight : 0);

      // меряем target относительно ScrollView (его контента)
      UIManager.measureLayout(
        targetNode,
        scrollNode,
        () => {},
        (x, y, width, height) => {
          // y — координата элемента внутри ScrollView (без учёта текущего scrollY)
          const elementTopOnScreen = y - scrollYRef.current;
          const elementBottomOnScreen = elementTopOnScreen + height;

          // небольшой зазор, чтобы курсор/подсказки не упирались в клаву
          const GAP = 12;

          // если низ элемента ниже видимой зоны — докручиваем
          if (elementBottomOnScreen + GAP > visibleBottomY) {
            const delta = elementBottomOnScreen + GAP - visibleBottomY;
            const nextY = Math.max(0, scrollYRef.current + delta);

            scroll.scrollTo({ y: nextY, animated: true });
          }

          // если верх элемента слишком высоко (редко, но бывает) — поднимем обратно
          // (например, при авто-скролле внизу и фокусе на верхнем поле)
          const TOP_GAP = 12;
          if (elementTopOnScreen < TOP_GAP) {
            const deltaUp = TOP_GAP - elementTopOnScreen;
            const nextY = Math.max(0, scrollYRef.current - deltaUp);
            scroll.scrollTo({ y: nextY, animated: true });
          }
        }
      );
    },
    [keyboardHeight, keyboardVisible]
  );

  const handleAnyInputFocus = useCallback(
    (e: any) => {
      const target = e?.nativeEvent?.target ?? null;
      // делаем defer, чтобы layout успел "схлопнуться" после появления клавиатуры
      requestAnimationFrame(() => scrollToFocused(target));
    },
    [scrollToFocused]
  );

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
  const isMemberComplete = (m: HouseholdMember) => m.gender !== null && m.age.trim() !== '' && m.profession !== '';
  const canAddMember = members.length === 0 || members.every(isMemberComplete);

  // по умолчанию всё свернуто
  const [personalOpen, setPersonalOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);

  const createId = () => Date.now().toString();

  const handleChangeAge = (text: string) => setAge(clampNumeric(text, 0, 100));
  const handleChangeArea = (text: string) => setArea(clampNumeric(text, 1));
  const handleChangePets = (text: string) => setPetsCount(clampNumeric(text, 0));
const isCustomRoomComplete = (r: Room) =>
  !r.isCustom || (r.name.trim() !== '' && r.count.trim() !== '');

const canAddRoom = rooms.every(isCustomRoomComplete);

const handleToggleRoom = (id: string) => {
  setRooms((prev) => {
    const checkedCount = prev.filter((r) => r.checked).length;
    const target = prev.find((r) => r.id === id);
    if (!target) return prev;

    const nextChecked = !target.checked;

    // ❗ нельзя снять галочку с последней выбранной комнаты
    if (!nextChecked && target.checked && checkedCount <= 1) {
      return prev;
    }

    return prev
      .map((room) => {
        if (room.id !== id) return room;

        // кастомную комнату при выключении удаляем
        if (room.isCustom && room.checked) {
          return { ...room, checked: false, count: '', _remove: true } as any;
        }

        // OFF -> очищаем количество
        if (!nextChecked) {
          return { ...room, checked: false, count: '' };
        }

        // ON -> если пусто, ставим 1
        const nextCount = room.count.trim() === '' ? '1' : room.count;
        return { ...room, checked: true, count: nextCount };
      })
      .filter((room: any) => !room._remove);
  });
};



  const handleChangeRoomName = (id: string, roomName: string) => {
    setRooms((prev) => prev.map((room) => (room.id === id ? { ...room, name: roomName } : room)));
  };

const handleChangeRoomCount = (id: string, text: string) => {
  const digits = text.replace(/\D/g, '');

  if (digits === '') {
    setRooms((prev) => {
      const checkedCount = prev.filter((r) => r.checked).length;
      const target = prev.find((r) => r.id === id);
      if (!target) return prev;

      const wouldUncheckLast = target.checked && checkedCount <= 1;

      return prev.map((room) =>
        room.id === id
          ? {
              ...room,
              count: '',
              checked: wouldUncheckLast ? true : false, // ❗ последнюю не выключаем
            }
          : room
      );
    });
    return;
  }

  const nextCount = clampNumeric(digits, 1, 10);

  setRooms((prev) =>
    prev.map((room) =>
      room.id === id ? { ...room, count: nextCount, checked: true } : room
    )
  );
};


const handleAddRoom = () => {
  if (!canAddRoom) return;

  setRooms((prev) => [
    ...prev,
    { id: createId(), name: '', count: '', checked: true, isCustom: true },
  ]);
};




  const updateMember = (id: string, patch: Partial<HouseholdMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const collapseAllMembers = useCallback(() => {
    setMembers((prev) => prev.map((m) => ({ ...m, expanded: false })));
  }, []);

  const collapseAllSections = useCallback(() => {
    setPersonalOpen(false);
    setHomeOpen(false);
    setHouseholdOpen(false);
    collapseAllMembers();
  }, [collapseAllMembers]);

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

  useEffect(() => {
    if (!householdOpen) collapseAllMembers();
  }, [householdOpen, collapseAllMembers]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        collapseAllSections();
      };
    }, [collapseAllSections])
  );

  const SelectedAvatar = AVATAR_COMPONENTS[selectedAvatarIndex];

  const renderSectionHeader = (title: string, open: boolean, onToggle: () => void) => (
    <View style={styles.sectionHeaderWrap}>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ArrowDown width={16} height={16} style={{ transform: [{ rotate: open ? '0deg' : '-90deg' }] }} />
      </Pressable>
      <View style={styles.sectionDivider} />
    </View>
  );

  // offset только для KAV (как в QuestionnaireLayout), но без "накручивания" паддингов снизу
  const keyboardVerticalOffset = useMemo(() => {
    // хэдер у нас вне KAV, поэтому offset минимальный
    // чуть учитываем safe-area снизу, чтобы на iOS не было странных зазоров
    return 10;
  }, [insets.bottom]);

  return (
    <View style={styles.container}>
      {/* шапка */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Настройки</Text>
        </View>
      </View>

      {/* ✅ KeyboardAvoidingView + ScrollView без лишних паддингов снизу */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
        contentContainerStyle={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
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
                  style={[styles.avatarOption, selectedAvatarIndex === index && styles.avatarOptionSelected]}
                >
                  <Icon width={36} height={36} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Личная информация */}
          <View style={styles.sectionContainer}>
            {renderSectionHeader('Личная информация', personalOpen, () => setPersonalOpen((v) => !v))}

            {personalOpen && (
              <View style={styles.sectionBody}>
                <InputField label="Имя:" value={name} onChangeText={setName} onFocus={handleAnyInputFocus} />

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
                  onFocus={handleAnyInputFocus}
                />

                <SelectField label="Часовой пояс:" value={timezone} onChange={setTimezone} options={TIMEZONES} />

                <SelectField label="Вид профессии:" value={profession} onChange={setProfession} options={PROFESSIONS} />
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
                    onFocus={handleAnyInputFocus}
                  />
                  <Text style={styles.areaSuffix}>м²</Text>
                </View>

                <InputField
                  label="Количество домашних животных:"
                  value={petsCount}
                  onChangeText={handleChangePets}
                  keyboardType="numeric"
                  onFocus={handleAnyInputFocus}
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
                      onFocus={handleAnyInputFocus}
                    />

                    <TextInput
                      style={styles.roomCountInput}
                      value={room.count}
                      onChangeText={(text) => handleChangeRoomCount(room.id, text)}
                      keyboardType="numeric"
                      onFocus={handleAnyInputFocus}
                    />
                  </View>
                ))}

                <Pressable onPress={handleAddRoom} style={[styles.addButton, { borderColor: canAddRoom ? Colors.primary : Colors.disabledprimary, }]}>
                  <Text style={{ fontSize: 24, color: canAddRoom ? Colors.primary : Colors.disabledprimary, }}>+</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Информация о домочадцах */}
          <View style={styles.sectionContainer}>
            {renderSectionHeader('Информация о домочадцах', householdOpen, () => setHouseholdOpen((v) => !v))}

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

                <Pressable onPress={canAddMember ? handleAddMember : undefined} style={[styles.addButton, { borderColor: canAddMember ? Colors.primary : Colors.disabledprimary, }]}>
                  <Text style={{ fontSize: 24, color: canAddMember ? Colors.primary : Colors.disabledprimary, }}>+</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    paddingBottom: 24, // ✅ фиксированный паддинг, НЕ зависит от клавиатуры
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: Colors.white,
  },
});
