// src/types/plan.ts

export interface Exercise {
  block: string;
  sets: number;
  reps: string;
  exercise: {
    name: string;
  };
}

export interface Session {
  id: number;
  date: string;
  dayOfWeek: string;
  sessionType: string;
  focus: string;
  trainingPlan: {goal: 'health' | 'strength' | 'muscle_gain';};
  exercises: Exercise[];
}

export interface Plan {
  goal: 'health' | 'strength' | 'muscle_gain';
  sessions?: Session[];
}
