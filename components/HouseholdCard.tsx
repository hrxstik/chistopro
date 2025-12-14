import MinusIcon from '@/assets/icons/minus.svg';
import PenIcon from '@/assets/icons/pen.svg';
import { RadioButton } from '@/components/RadioButton';
import { SelectField } from '@/components/SelectField';
import { Colors } from '@/constants/colors';
import { HouseholdMember } from '@/types/household';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  member: HouseholdMember;
  onChange: (patch: Partial<HouseholdMember>) => void;
  onDelete: () => void;
  onToggle: () => void;
};

export function HouseholdCard({
  member,
  onChange,
  onDelete,
  onToggle,
}: Props) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      {member.expanded ? (
        <View style={styles.nameContainer}>
          <Text style={styles.nameLabel}>Имя домочадца:</Text>

          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              value={member.name}
              onChangeText={(name) => onChange({ name })}
            />

            <Pressable onPress={onDelete} style={styles.iconBtn}>
              <MinusIcon width={20} height={20} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.collapsedRow}>
          <Pressable onPress={onToggle} style={{ flex: 1 }}>
            <Text style={styles.title}>{member.name}</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable onPress={onToggle}>
              <PenIcon width={20} height={20} />
            </Pressable>

            <Pressable onPress={onDelete}>
              <MinusIcon width={20} height={20} />
            </Pressable>
          </View>
        </View>
      )}

      {/* CONTENT */}
      {member.expanded && (
        <View style={styles.content}>
          {/* Возраст */}
          <Text style={[styles.label, styles.firstLabel]}>Возраст:</Text>
          <TextInput
            style={styles.input}
            value={member.age}
            onChangeText={(age) => onChange({ age })}
            keyboardType="numeric"
          />

          {/* Пол */}
          <Text style={styles.label}>Пол:</Text>

          <RadioButton
            label="Мужской"
            selected={member.gender === 'male'}
            onPress={() => onChange({ gender: 'male' })}
            borderColor={Colors.primary}
          />

          <RadioButton
            label="Женский"
            selected={member.gender === 'female'}
            onPress={() => onChange({ gender: 'female' })}
            borderColor={Colors.red}
          />

          {/* Профессия */}
          <SelectField
            label="Профессия:"
            value={member.profession}
            onChange={(profession) => onChange({ profession })}
            options={[
              'Безработный',
              'Студент',
              'Удалёнщик',
              'Офисный работник',
              'Гибридный работник',
              'Уличный работник',
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },

  /* header-expanded */

  nameContainer: {
    // раньше здесь было marginBottom: 16 — убрали,
    // чтобы отступ регулировался только через первый label
  },
  nameLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  iconBtn: {
    marginLeft: 12,
  },

  /* header-collapsed */

  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8, // чуть меньше, чтобы не создавать лишнюю дырку
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },

  /* content */

  content: {
    marginTop: 8, // небольшой зазор после имени
  },

  // первый label (Возраст) — без extra-top
  firstLabel: {
    marginTop: 0,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12, // одинаковый отступ между блоками: [поле] -> label
  },

  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
