import MinusIcon from '@/assets/icons/minus.svg';
import PenIcon from '@/assets/icons/pen.svg';
import { InputField } from '@/components/InputField';
import { RadioButton } from '@/components/RadioButton';
import { SelectField } from '@/components/SelectField';
import { Colors } from '@/constants/colors';
import { HouseholdMember } from '@/types/household';
import {
  Pressable,
  StyleSheet,
  Text,
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
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Имя домочадца:"
                value={member.name}
                onChangeText={(name) => onChange({ name })}
              />
            </View>

            <Pressable onPress={onDelete} style={styles.iconBtn}>
              <MinusIcon width={20} height={20} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.collapsedRow}>
          <Pressable onPress={onToggle} style={{ flex: 1}}>
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
          <InputField
            label="Возраст:"
            value={member.age}
            onChangeText={(text) => onChange({ age: text })}
            keyboardType="numeric"
            min={0}
            max={100}
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
    // отступы вниз задаёт сам InputField
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 12,
    marginTop: 20,
  },

  /* header-collapsed */

  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    marginTop: 0, // небольшой зазор после имени
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 0, // как в step1: между InputField(Возраст) и "Пол"
  },
});

export default HouseholdCard;
