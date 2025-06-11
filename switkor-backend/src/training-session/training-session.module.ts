import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './training-session.entity';
import { TrainingSessionService } from '../training-session/training-session.service';
import { TrainingSessionController } from './training-session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingSession])],
  providers: [TrainingSessionService],
  controllers: [TrainingSessionController],
  exports: [TrainingSessionService],
})
export class TrainingSessionModule {}
