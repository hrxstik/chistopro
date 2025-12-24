import { CloudSmall } from '@/components/CloudSmall';
import { HouseholdCard } from '@/components/HouseholdCard';
import { OnboardingButton } from '@/components/OnboardingButton';
import { QuestionnaireLayout } from '@/components/QuestionnaireLayout';
import { Colors } from '@/constants/colors';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { HouseholdMember } from '@/types/household';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function Step3() {
  const router = useRouter();
  const { data, updateStep3 } = useQuestionnaire();
  const createId = () => Date.now().toString();

  const [members, setMembers] = useState<HouseholdMember[]>(
    data.householdMembers.length > 0
      ? data.householdMembers
      : [
          {
            id: createId(),
            name: 'Домочадец 1',
            gender: null,
            age: '',
            profession: '',
            expanded: true,
          },
        ]
  );

  useEffect(() => {
    updateStep3(members);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const scrollRef = useRef<ScrollView | null>(null);

  const isMemberComplete = (m: HouseholdMember) =>
    m.gender !== null && m.age.trim() !== '' && m.profession !== '';

  const isValid = members.length === 0 || members.every(isMemberComplete);
  const canAddMember = members.length === 0 || members.every(isMemberComplete);

  const addMember = () => {
    setMembers((prev) => [
      ...prev.map((m) => ({ ...m, expanded: false })),
      {
        id: createId(),
        name: `Домочадец ${prev.length + 1}`,
        gender: null,
        age: '',
        profession: '',
        expanded: true,
      },
    ]);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  return (
    <QuestionnaireLayout
      showBack
      header={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Image
            source={require('@/assets/images/chubrik1_dirty1.png')}
            style={{ width: 121, height: 181 }}
          />
          <CloudSmall
            width={190}
            text={'Расскажи\nо своих домочадцах,\nчтобы мы \nподобрали задачи\nдля тебя'}
          />
        </View>
      }
      footer={
        <OnboardingButton
          title="Продолжить"
          disabled={!isValid}
          onPress={() => router.push('/questionnaire/step4')}
        />
      }
    >
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 32 }}>
        {members.map((member) => (
          <HouseholdCard
            key={member.id}
            member={member}
            onToggle={() =>
              setMembers((prev) =>
                prev.map((m) =>
                  m.id === member.id
                    ? { ...m, expanded: !m.expanded }
                    : { ...m, expanded: false }
                )
              )
            }
            onChange={(patch) =>
              setMembers((prev) =>
                prev.map((m) => (m.id === member.id ? { ...m, ...patch } : m))
              )
            }
            onDelete={() => setMembers((prev) => prev.filter((m) => m.id !== member.id))}
          />
        ))}

        {/* Кнопка + */}
        <Pressable
          onPress={canAddMember ? addMember : undefined}
          style={{
            marginTop: 8,
            width: 40,
            height: 40,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: canAddMember ? Colors.primary : Colors.disabledprimary,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.white,
          }}
        >
          <Text style={{ fontSize: 24, color: canAddMember ? Colors.primary : Colors.disabledprimary, }}>+</Text>
        </Pressable>
      </ScrollView>
    </QuestionnaireLayout>
  );
}
