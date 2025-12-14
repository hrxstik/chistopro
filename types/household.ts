export type HouseholdMember = {
  id: string;
  name: string;
  gender: 'male' | 'female' | null;
  age: string;
  profession: string;
  expanded: boolean;
};
