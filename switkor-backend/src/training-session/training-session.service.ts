import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './training-session.entity';

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepo: Repository<TrainingSession>,
  ) {}

  async getSessionById(id: number, userId?: number): Promise<TrainingSession> {
    const session = await this.sessionRepo.findOne({
      where: {
        id,
        trainingPlan: {
          user: { id: userId },
        },
      },
      relations: ['trainingPlan', 'exercises', 'exercises.exercise'],
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return session;
  }
}
