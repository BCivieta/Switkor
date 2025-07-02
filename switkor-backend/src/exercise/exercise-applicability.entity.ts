import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exercise } from './exercise.entity';
import { Goal } from '../common/enums/training.enums';

@Entity()
export class ExerciseApplicability {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.applicabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({
  type: 'enum',
  enum: Goal,
  })
  goal: Goal;

  @Column()
  level: 'beginner' | 'intermediate' | 'advanced';
}
