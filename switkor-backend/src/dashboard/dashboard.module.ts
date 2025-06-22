import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TrainingPlanModule } from '../training-plan/training-plan.module';
import { TrainingSessionModule } from '../training-session/training-session.module';

@Module({
  imports: [TrainingPlanModule, TrainingSessionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}