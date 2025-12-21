import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';
import { useEffect, useRef } from 'react';
import { Animated, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
};

export function QuestionnaireLayout({ header, children, footer, showBack }: Props) {
  const insets = useSafeAreaInsets();
  const footerShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const handleShow = (e: any) => {
      const keyboardHeight = e.endCoordinates?.height ?? 0;
      const offset = Math.max(0, keyboardHeight - insets.bottom) + 17; // небольшой зазор
      Animated.timing(footerShift, {
        toValue: -offset,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const handleHide = () =>
      Animated.timing(footerShift, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom, footerShift]);

  return (
    <View style={styles.container}>
      <View style={styles.back}>{<BackButton />}</View>
      <View style={styles.header}>{header}</View>
      <View style={styles.content}>{children}</View>
      <Animated.View style={[styles.footer, { transform: [{ translateY: footerShift }] }]}>
        {footer}
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: '20%',
  },
  header: {
    marginTop: 100,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    position: 'absolute',
    top: 44,
    left: 10,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
});
