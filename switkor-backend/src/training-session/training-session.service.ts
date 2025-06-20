import { Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './training-session.entity';

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepo: Repository<TrainingSession>,
  ) {}
  //devuelve sesión por su Id
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
  //marca sesión como completada
  async markComplete(id: number): Promise<TrainingSession> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Sesión con id ${id} no encontrada.`);
    }

    // comparar sólo la parte de fecha (sin horas)
    const today = new Date();
    const sessionDate = new Date(session.date);
    const isSameDay =
      today.getFullYear() === sessionDate.getFullYear() &&
      today.getMonth() === sessionDate.getMonth() &&
      today.getDate() === sessionDate.getDate();

    if (!isSameDay) {
      const fechaStr = sessionDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      throw new BadRequestException(
        `Hoy no toca completar esta sesión. La sesión es el ${fechaStr}.`
      );
    }

    session.completed = true;
    return this.sessionRepo.save(session);
  }
}
