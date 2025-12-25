import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HouseholdMember } from '@/types/household';
import { Room } from '@/types/profile';

type QuestionnaireData = {
  // Step 1
  name: string;
  age: string;
  gender: 'male' | 'female' | null;
  
  // Step 2
  profession: string;
  
  // Step 3
  householdMembers: HouseholdMember[];
  
  // Step 4
  area: string;
  hasPets: boolean;
  rooms: Room[];
};

type QuestionnaireContextType = {
  data: QuestionnaireData;
  updateStep1: (data: Partial<Pick<QuestionnaireData, 'name' | 'age' | 'gender'>>) => void;
  updateStep2: (profession: string) => void;
  updateStep3: (members: HouseholdMember[]) => void;
  updateStep4: (data: Partial<Pick<QuestionnaireData, 'area' | 'hasPets' | 'rooms'>>) => void;
  reset: () => void;
};

const initialState: QuestionnaireData = {
  name: '',
  age: '',
  gender: null,
  profession: '',
  householdMembers: [],
  area: '',
  hasPets: false,
  rooms: [],
};

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<QuestionnaireData>(initialState);

  const updateStep1 = (updates: Partial<Pick<QuestionnaireData, 'name' | 'age' | 'gender'>>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const updateStep2 = (profession: string) => {
    setData((prev) => ({ ...prev, profession }));
  };

  const updateStep3 = (members: HouseholdMember[]) => {
    setData((prev) => ({ ...prev, householdMembers: members }));
  };

  const updateStep4 = (updates: Partial<Pick<QuestionnaireData, 'area' | 'petsCount' | 'rooms'>>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const reset = () => {
    setData(initialState);
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        data,
        updateStep1,
        updateStep2,
        updateStep3,
        updateStep4,
        reset,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
}

