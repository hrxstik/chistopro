import { Stack } from 'expo-router';
import { QuestionnaireProvider } from '@/contexts/QuestionnaireContext';

export default function RootLayout() {
    return (
        <QuestionnaireProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </QuestionnaireProvider>
    );
}