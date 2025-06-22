import { Injectable } from '@nestjs/common';
import { TrainingPlanService } from '../training-plan/training-plan.service';
import { TrainingSessionService } from '../training-session/training-session.service';
import { User } from '../user/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    private readonly planService: TrainingPlanService,
    private readonly sessionService: TrainingSessionService,
  ) {}

  async getDashboardData(user: User) {
    // 1. Obtener los planes actuales y anteriores (máximo 2)
    const plans = await this.planService.getCurrentAndPreviousPlans(user);

    // Extraer todas las sesiones de esos dos planes
    const allSessions = plans.flatMap(plan => plan.sessions);

    // 2. Obtener sesiones completadas para el gráfico y la racha
    const completedSessions = await this.sessionService.getCompletedSessionsByUser(user.id);

    return {
      allSessions,
      completedSessions,
    };
  }
}