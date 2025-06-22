//src\dashboard\dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { TrainingPlanService } from '../training-plan/training-plan.service';
import { User } from '../user/user.entity';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class DashboardService {
  constructor(
    private readonly planService: TrainingPlanService,
  ) {}

  async getDashboardData(user: User) {
    // 1. Obtener los planes actuales y anteriores (máximo 2)
    const plans = await this.planService.getCurrentAndPreviousPlans(user);

    // Extraer todas las sesiones de esos dos planes
    const allSessions = plans.flatMap((plan) => plan.sessions);
    const today = new Date();

    // Calcular próxima sesión
    const next = allSessions
      .filter((s) => !s.completed)
      .find((s) => new Date(s.date) >= today);

    const nextSession = next
      ? {
          id: next.id,
          date: new Date(next.date).toISOString().split('T')[0], // YYYY-MM-DD
        }
      : null;

    // 2. Obtener la racha de sesiones completadas
    const completedSessions = allSessions
      .filter((s) => s.completed)
      .map((s) => ({
        ...s,
        dateObj: new Date(s.date),
      }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    let streak = 0;
    for (const s of completedSessions) {
      if (s.dateObj > today) continue;
      if (s.completed) streak++;
      else break;
    }

   // Datos para gráfica últimos 6 meses
    const chartData: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const refDate = subMonths(today, i);
      const label = format(refDate, 'MMM yyyy', { locale: es });
      const count = completedSessions.filter((s) => {
        const d = s.dateObj;
        return (
          d.getMonth() === refDate.getMonth() &&
          d.getFullYear() === refDate.getFullYear()
        );
      }).length;
      chartData.push({ month: label, count });
    }

    return {
      allSessions,
      completedSessions,
      nextSession,
      streak,
      chartData,
    };
  }
}