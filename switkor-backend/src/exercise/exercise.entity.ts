import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Goal } from '../common/enums/training.enums';
import { OneToMany } from 'typeorm';
import { ExerciseApplicability } from './exercise-applicability.entity';

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

  @Column({ default: 'main_basic' })
  category:
    | 'main_basic'
    | 'main_complementary'
    | 'accessory'
    | 'warmup'
    | 'isolation'
    | 'recovery';

  @OneToMany(() => ExerciseApplicability, (app) => app.exercise, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  applicabilities: ExerciseApplicability[];
}
