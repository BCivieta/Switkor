import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TrainingPlan } from '../training-plan/training-plan.entity';
import { TrainingExercise } from './training-exercise.entity';

@Entity('training_session')
export class TrainingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dayNumber' })
  dayNumber: number;

  @ManyToOne(() => TrainingPlan, (plan) => plan.sessions, {
    onDelete: 'CASCADE',
  })
  trainingPlan: TrainingPlan;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  weekNumber: number;

  @Column()
  dayOfWeek: string;

  @Column()
  focus: string;

  @Column({ default: 'main' })
  sessionType: 'main' | 'recovery';

  @OneToMany(() => TrainingExercise, (exercise) => exercise.session)
  exercises: TrainingExercise[];
}
