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

    console.log('✅ Entrando en getDashboardData con usuario:', user.id);
    // 1. Obtener los planes actuales y anteriores (máximo 2)
    const plans = await this.planService.getCurrentAndPreviousPlans(user);
    console.log('📦 Planes obtenidos:', plans.length);

    // Extraer todas las sesiones de esos dos planes
    const allSessions = plans.flatMap((plan) => plan.sessions);
    console.log('📆 Total sesiones obtenidas:', allSessions.length);
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
    

     // ✅ Crear map de conteo por mes
    const monthCounts: Record<string, number> = {};

    // Ordenar TODAS las sesiones por fecha descendente (para racha)
    const sortedSessions = [...allSessions].map((s) => ({
      ...s,
      dateObj: new Date(s.date),
    })).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

   // ✅ Inicializar meses objetivo
    const chartData: { month: string; count: number }[] = [];
    const targetMonths: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const refDate = subMonths(today, i);
      const label = format(refDate, 'MMM yyyy', { locale: es });
      monthCounts[label] = 0;
      targetMonths.push(label);
    }

    // ✅ Contar sesiones completadas por mes solo entre los 6 últimos
    for (const s of sortedSessions) {
      if (!s.completed) continue;

      const label = format(s.dateObj, 'MMM yyyy', { locale: es });
      if (monthCounts[label] !== undefined) {
        monthCounts[label]++;
      }
    }

    for (const label of targetMonths) {
      chartData.push({ month: label, count: monthCounts[label] });
    }

    // ✅ Calcular racha
    let streak = 0;
    for (const s of sortedSessions) {
      if (s.dateObj > today) continue;
      if (s.completed) streak++;
      else break;
    }

    return {
      allSessions,
      nextSession,
      streak,
      chartData,
    };
  }
}