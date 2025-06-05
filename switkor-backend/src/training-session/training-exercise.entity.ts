import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TrainingSession } from './training-session.entity';
import { Exercise } from '../exercise/exercise.entity';

@Entity()
export class TrainingExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrainingSession, (session) => session.exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingSessionId' })
  session: TrainingSession;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

  @Column()
  sets: number;

  @Column()
  reps: string;

  @Column()
  order: number;

  @Column({ type: 'text' })
  block: ExerciseBlock;
}
export enum ExerciseBlock {
  WARMUP = 'warmup',
  MAIN = 'main',
  CORE = 'core',
  ACCESSORY = 'accessory',
  GLOBAL = 'global',
  HIIT = 'hiit',
}
