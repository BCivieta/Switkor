import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './training-session.entity';

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepo: Repository<TrainingSession>,
  ) {}

  async getSessionById(id: number): Promise<TrainingSession | null> {
    return this.sessionRepo.findOne({
      where: { id },
      relations: ['trainingPlan', 'exercises', 'exercises.exercise'],
    });
  }
}
