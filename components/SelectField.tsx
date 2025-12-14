import { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View
} from 'react-native';

import ArrowDown from '@/assets/icons/arrowdown.svg';
import { Colors } from '@/constants/colors';
import { StyleSheet } from 'react-native';
const TIMEZONES = [
  'Москва (GMT +3)',
  'Калининград (GMT +2)',
  'Самара (GMT +4)',
  'Екатеринбург (GMT +5)',
];

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function SelectField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.select} onPress={() => setOpen(true)}>
          <Text style={styles.value}>{value}</Text>
          <ArrowDown width={10} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modal}>
            {TIMEZONES.map((tz) => (
              <Pressable
                key={tz}
                style={styles.option}
                onPress={() => {
                  onChange(tz);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{tz}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  select: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',  
  },
  value: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  option: {
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
  },
});
