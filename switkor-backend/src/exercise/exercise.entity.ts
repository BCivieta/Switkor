import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
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

  @Column({ type: 'varchar', default: 'general', nullable: false })
  goal: string; // 'muscle_gain', 'strength', 'health'

  @Column({ default: 'main_basic' })
  category:
    | 'main_basic'
    | 'main_complementary'
    | 'accessory'
    | 'warmup'
    | 'isolation'
    | 'recovery';
}
