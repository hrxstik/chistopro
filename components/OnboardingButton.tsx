// components/OnboardingButton.tsx
import { Colors } from '@/constants/colors';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function OnboardingButton({
  title,
  onPress,
  disabled,
}: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '70%',
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  text: {
    fontFamily: 'Nexa',
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  disabledText: {
    color: Colors.primary,
    opacity: 0.4,
  },
});
