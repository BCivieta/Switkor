import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  exports: [TypeOrmModule],
})
export class ExerciseModule {}
