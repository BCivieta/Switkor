// src/dashboard/dashboard.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TrainingPlanService } from '../training-plan/training-plan.service';
import { User } from '../user/user.entity';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class DashboardService {
  constructor(private readonly planService: TrainingPlanService) {}

  async getDashboardData(user: User) {
    try {
      console.log('✅ Entrando en getDashboardData con usuario:', user.id);

      const plans = await this.planService.getCurrentAndPreviousPlans(user);
      console.log('📦 Planes obtenidos:', plans.length);

      // Extraer sesiones
      const allSessions = plans.flatMap((plan) => plan.sessions);
      console.log('📆 Total sesiones obtenidas:', allSessions.length);

      if (!allSessions || !Array.isArray(allSessions)) {
        console.error(
          '❌ Las sesiones no están definidas correctamente:',
          allSessions,
        );
        throw new InternalServerErrorException('Sesiones no válidas');
      }

      const today = new Date();

      // Buscar próxima sesión
      const normalize = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());

      const todayDate = normalize(new Date());

      const next = allSessions
        .filter((s) => !s.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) //Ordena por fecha ascendente
        .find((s) => normalize(new Date(s.date)) >= todayDate);//Encuentra la primera igual o posterior a hoy

      if (next) {
        console.log('➡️ Próxima sesión encontrada:', next.id, next.date);
      }

      const nextSession = next
        ? {
            id: next.id,
            date: new Date(next.date).toISOString().split('T')[0],
          }
        : null;

      // Preparar gráfico mensual
      const monthCounts: Record<string, number> = {};
      const sortedSessions = [...allSessions]
        .map((s) => ({
          ...s,
          dateObj: new Date(s.date),
        }))
        .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

      const chartData: { month: string; count: number }[] = [];
      const targetMonths: string[] = [];

      for (let i = 5; i >= 0; i--) {
        const refDate = subMonths(today, i);
        const label = format(refDate, 'MMM yyyy', { locale: es });
        monthCounts[label] = 0;
        targetMonths.push(label);

        // Debug opcional para ver info de los planes
        const plan = plans[i];
        if (plan) {
          console.log(
            `➡️ Plan ${i + 1} - ID: ${plan.id}, sesiones: ${plan.sessions?.length}`,
          );
        } else {
          console.log(`⚠️ No hay plan para el índice ${i}`);
        }
      }

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

      // Calcular racha
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
    } catch (error) {
      console.error('❌ Error en getDashboardData:', error);
      throw new InternalServerErrorException(
        'Error al cargar el panel de usuario',
      );
    }
  }
}
