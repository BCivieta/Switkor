import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { TrainingSession } from '../training-session/training-session.entity';

@Entity()
export class TrainingPlan {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, ({ trainingPlans }) => trainingPlans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  goal: 'muscle_gain' | 'strength' | 'health';

  @Column()
  level: 'beginner' | 'intermediate' | 'advanced';

  @Column()
  sex: 'male' | 'female';

  @Column({ name: 'days_per_week' })
  daysPerWeek: number;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => TrainingSession, (session) => session.trainingPlan)
  sessions: TrainingSession[];
}
