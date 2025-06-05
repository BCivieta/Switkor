import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './training-plan.entity';
import { TrainingPlanService } from './training-plan.service';
import { TrainingPlanController } from './training-plan.controller';
import { TrainingSession } from '../training-session/training-session.entity';
import { TrainingExercise } from '../training-session/training-exercise.entity';
import { Exercise } from '../exercise/exercise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingPlan,
      TrainingSession,
      TrainingExercise,
      Exercise,
    ]),
  ],
  providers: [TrainingPlanService],
  controllers: [TrainingPlanController],
})
export class TrainingPlanModule {}
