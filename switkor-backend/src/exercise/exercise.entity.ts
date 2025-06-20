import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Goal } from '../common/enums/training.enums';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  pattern: string; // 'vertical_push', 'vertical_pull', 'horizontal_push', 'horizontal_pull',
  // 'hip_dominant', 'knee_dominant', 'core', 'isolation'

  @Column()
  muscles: string; // Ej: 'glutes', 'hamstrings', 'quads', 'chest', 'back', 'shoulders', 'abs', 'biceps', 'triceps'

  @Column()
  level: string; // 'beginner', 'intermediate', 'advanced'

  @Column({
    type: 'enum',
    enum: Goal,
    array: true,
    default: [Goal.MUSCLE_GAIN, Goal.STRENGTH, Goal.HEALTH],
  })
  goal: Goal[];

  @Column({ default: 'main_basic' })
  category:
    | 'main_basic'
    | 'main_complementary'
    | 'accessory'
    | 'warmup'
    | 'isolation'
    | 'recovery';
}
