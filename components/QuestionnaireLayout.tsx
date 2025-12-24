
import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
  /** Поднимать только контейнер контента (между хэдером и футером) над клавиатурой */
  keyboardAwareContent?: boolean;
  /** Дополнительный offset для KeyboardAvoidingView, если нужно сдвинуть ещё выше */
  keyboardVerticalOffset?: number;
};

export function QuestionnaireLayout({
  header,
  children,
  footer,
  showBack = true,
  keyboardAwareContent,
  keyboardVerticalOffset,
}: Props) {
  const insets = useSafeAreaInsets();

  const footerTranslateY = useRef(new Animated.Value(0)).current;
  const FOOTER_PERCENT = 0.1;
  const gap = 8;

  const windowHeight = Dimensions.get('window').height;
  const baseBottom = Math.round(windowHeight * FOOTER_PERCENT);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const handleShow = (e: any) => {
      setKeyboardVisible(true);

      const keyboardHeight = e?.endCoordinates?.height ?? 0;
      const lift = keyboardHeight - 25;

      const duration = Platform.OS === 'ios' ? (e?.duration ?? 250) : 200;

      Animated.timing(footerTranslateY, {
        toValue: -lift,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const handleHide = (e: any) => {
      setKeyboardVisible(false);

      const duration = Platform.OS === 'ios' ? (e?.duration ?? 200) : 180;

      Animated.timing(footerTranslateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [footerTranslateY]);

  // offset нужен только KAV, не кнопке
  const contentKeyboardOffset = useMemo(() => {
    // добавим ещё высоту футера, чтобы KAV поднимал контент чуть сильнее
    // (можно оставить 0, если делаешь paddingBottom — обычно хватает одного paddingBottom)
    return (keyboardVerticalOffset ?? 0) + insets.bottom;
  }, [keyboardVerticalOffset, insets.bottom]);

  // ВАЖНО: добавляем padding снизу контенту, чтобы последний инпут не уехал под кнопку
  const contentBottomPadding = useMemo(() => {
    if (!keyboardVisible) return 0;
    return footerHeight - 30; // можно + 8..16 если хочется ещё выше
  }, [keyboardVisible, footerHeight]);

  //const footerBg = keyboardVisible ? 'transparent' : Colors.background;
  const footerBg = Colors.background;
  const isAndroid = Platform.OS === 'android';
return (
  <View style={styles.container}>
    {showBack && (
      <View style={styles.back}>
        <BackButton />
      </View>
    )}

    <View style={styles.header}>{header}</View>

    <KeyboardAvoidingView
      enabled={keyboardAwareContent}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={contentKeyboardOffset}
      style={styles.content}
    >
      <View style={{ flex: 1, paddingBottom: contentBottomPadding }}>
        {children}
      </View>
    </KeyboardAvoidingView>

    {/* ✅ Плашка НИЖНЕЙ ЗОНЫ (не двигается), только без клавиатуры */}
    {!keyboardVisible && (
      <View
        pointerEvents="none"
        style={[
          styles.footerPlate,
          {
            height: baseBottom + footerHeight + 2,
            backgroundColor: Colors.background,
          },
        ]}
      />
    )}

    {/* ✅ Кнопка (двигается), всегда без фона */}
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.footerFloating,
        {
          bottom: baseBottom,
          transform: [{ translateY: footerTranslateY }],
          backgroundColor: footerBg,
        },
      ]}
      onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
    >
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
    zIndex: 10,
  },
  content: {
    flex: 1,
  },

  footerPlate: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerFloating: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

