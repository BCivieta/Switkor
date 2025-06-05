import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TrainingPlan } from '../training-plan/training-plan.entity';

// Esta clase representa la tabla "user" en la base de datos
@Entity()
export class User {
  // Columna "id" auto-incremental y clave primaria
  @PrimaryGeneratedColumn()
  id: number;

  // Columna para el email del usuario
  @Column({ unique: true })
  email: string;

  // Columna para la contraseña del usuario (encriptada con bcrypt)
  @Column()
  password: string;

  // Columna opcional para guardar el nombre o apodo del usuario
  @Column({ nullable: true })
  name?: string;

  @OneToMany(() => TrainingPlan, (plan) => plan.user)
  trainingPlans: TrainingPlan[];
}
