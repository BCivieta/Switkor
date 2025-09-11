//src\training-session\training-session.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      relations: [
        'trainingPlan',
        'exercises',
        'exercises.exercise',
        'exercises.exercise.applicabilities',
      ],
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return session;
  }
  //marca sesión como completada
  async markComplete(id: number, userId: number): Promise<TrainingSession> {
    const session = await this.sessionRepo.findOne({
      where: {
        id,
        trainingPlan: { user: { id: userId } }, // <- filtra por propietario
      },
      relations: ['trainingPlan'],
    });
    if (!session) {
      throw new NotFoundException(`Sesión con id ${id} no encontrada.`);
    }

    const toYmd = (d: Date | string): string =>
    (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      ? d
      : new Date(d).toLocaleDateString('sv-SE');

  const todayYmd   = new Date().toLocaleDateString('sv-SE');
  const sessionYmd = toYmd(session.date);

    if (todayYmd !== sessionYmd) {
      const [y, m, da] = sessionYmd.split('-');
      throw new BadRequestException(
        `Hoy no toca completar esta sesión. La sesión es el ${da}/${m}/${y}.`,
      );
    }

    session.completed = true;
    //log de depuración
    console.log('DEBUG fechas:', {
      sessionDate: session.date,
      today: new Date(),
      todayYmd,
      sessionYmd,
      tzOffset: new Date().getTimezoneOffset(),
    });

    return this.sessionRepo.save(session);
  }

  async getCompletedSessionsByUser(userId: number): Promise<TrainingSession[]> {
    return this.sessionRepo.find({
      where: {
        completed: true,
        trainingPlan: {
          user: { id: userId },
        },
      },
      relations: ['trainingPlan'],
      order: {
        date: 'ASC',
      },
    });
  }
}
