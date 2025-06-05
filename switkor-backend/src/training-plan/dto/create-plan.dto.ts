export class CreatePlanDto {
  sex: 'male' | 'female';
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'muscle_gain' | 'strength' | 'health';
  daysPerWeek: 3 | 4 | 5;
}
