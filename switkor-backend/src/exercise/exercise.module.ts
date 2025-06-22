import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseApplicability } from './exercise-applicability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExerciseApplicability])],
  exports: [TypeOrmModule],
})
export class ExerciseModule {}
