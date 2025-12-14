import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';
import { StyleSheet, View } from 'react-native';
type Props = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
};

export function QuestionnaireLayout({ header, children, footer, showBack }: Props) {
  return (
    <View style={styles.container}>
              <View style={styles.back}>
        {<BackButton />}
        </View>
      <View style={styles.header}>

        {header}
      </View>
      <View style={styles.content}>{children}</View>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: 45,
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
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingBottom: 32, // было 100
  },
});
