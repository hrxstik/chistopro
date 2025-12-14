import TickIcon from '@/assets/icons/tick.svg'; // <-- твой SVG
import { Colors } from '@/constants/colors';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  checked: boolean;
  onToggle: () => void;
};

export function Checkbox({ checked, onToggle }: Props) {
  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <TickIcon width={20} height={20} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  boxChecked: {
    backgroundColor: '#fff', // если нужно голубое — поставь Colors.primary + белый tick
  },
});
