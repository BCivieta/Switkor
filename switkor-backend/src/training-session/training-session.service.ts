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

    // Normaliza a YYYY-MM-DD "neutro"
    const toYmd = (d: Date | string) => {
      const dt = d instanceof Date ? d : new Date(d);
      const tzOffsetMs = dt.getTimezoneOffset() * 60_000;
      return new Date(dt.getTime() - tzOffsetMs).toISOString().slice(0, 10);
    };

    const todayYmd = toYmd(new Date());
    const sessionYmd = toYmd(session.date);

    if (todayYmd !== sessionYmd) {
      const fechaStr = sessionYmd.split('-').reverse().join('/'); // DD/MM/YYYY
      throw new BadRequestException(
        `Hoy no toca completar esta sesión. La sesión es el ${fechaStr}.`,
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
