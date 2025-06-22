// src/training-plan/training-plan.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { TrainingSession } from '../training-session/training-session.entity';
import { TrainingExercise } from '../training-session/training-exercise.entity';
import { Exercise } from '../exercise/exercise.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { User } from '../user/user.entity';
import { addDays, startOfWeek, isMonday, addWeeks } from 'date-fns';
import { ExerciseBlock } from '../common/enums/exercise-block.enum';
import { Goal } from '../common/enums/training.enums';
import { ExerciseApplicability } from '../exercise/exercise-applicability.entity';

@Injectable()
export class TrainingPlanService {
  constructor(
    @InjectRepository(TrainingPlan)
    private planRepo: Repository<TrainingPlan>,

    @InjectRepository(TrainingSession)
    private sessionRepo: Repository<TrainingSession>,

    @InjectRepository(TrainingExercise)
    private exerciseRepo: Repository<TrainingExercise>,

    @InjectRepository(Exercise)
    private baseExerciseRepo: Repository<Exercise>,

    @InjectRepository(ExerciseApplicability)
    private applicabilityRepo: Repository<ExerciseApplicability>,
  ) {}

  //Crea un plan de entrenamiento de 4 semanas
  //con sesiones generadas por semana y día según los parámetros del usuario.

  async createPlan(dto: CreatePlanDto, user: User): Promise<TrainingPlan> {
    const { level, sex, goal, daysPerWeek } = dto;

    const applicable = await this.applicabilityRepo.find({
      relations: ['exercise'],
      where: {
        goal: dto.goal as Goal,
        level: dto.level,
      },
    });

    // Calcula el lunes de la próxima semana si hoy no es lunes
    const today = new Date();
    const startDate = isMonday(today)
      ? today
      : addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
    const endDate = addDays(startDate, 27); // 4 semanas completas

    // Eliminamos sesiones futuras del usuario antes de generar un nuevo plan
    const sessionsToDelete = await this.sessionRepo.find({
      where: {
        trainingPlan: {
          user: { id: user.id },
        },
        date: MoreThanOrEqual(startDate),
      },
      relations: ['trainingPlan', 'trainingPlan.user'],
    });

    await this.sessionRepo.remove(sessionsToDelete);

    // Crea y guarda el plan en la base de datos
    const plan = this.planRepo.create({
      user,
      goal,
      level,
      sex,
      daysPerWeek,
      startDate,
      endDate,
    });
    await this.planRepo.save(plan);

    // Define qué días de la semana se entrena en función de los días elegidos
    const dayOffsetsMap = { 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 3, 5, 6] };
    const sessionsToInsert: Partial<TrainingSession>[] = [];
    for (let week = 1; week <= 4; week++) {
      for (let dayIdx = 0; dayIdx < daysPerWeek; dayIdx++) {
        const offset = dayOffsetsMap[daysPerWeek][dayIdx];
        const date = addDays(startDate, (week - 1) * 7 + offset);
        sessionsToInsert.push({
          trainingPlan: { id: plan.id } as any,
          date,
          weekNumber: week,
          dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'long' }),
          dayNumber: dayIdx + 1,
          focus: this.getFocusForDay(dayIdx + 1, daysPerWeek).join(','),
          sessionType: daysPerWeek === 5 && dayIdx === 4 ? 'recovery' : 'main',
        });
      }
    }
    //console.log('📅 Sesiones a insertar:', JSON.stringify(sessionsToInsert, null, 2));
    // Bulk insert de sesiones con QueryBuilder
    const updatedPlan = await this.planRepo.findOne({
      where: { id: plan.id },
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ],
    });

    if (!updatedPlan || !updatedPlan.sessions) {
      console.error('❌ Plan actualizado no encontrado o sin sesiones');
      throw new Error('No se pudieron cargar las sesiones del plan');
    }

    console.log(
      '✅ Plan actualizado con sesiones:',
      JSON.stringify(updatedPlan, null, 2),
    );

    // 5) Refactor: Generar todos los ejercicios y guardarlos de una sola vez
    const exercisesToInsert: Partial<TrainingExercise>[] = [];
    const weekOneMap: Record<
      number,
      { exercise: Exercise; sets: number; reps: string; block: ExerciseBlock }[]
    > = {};

    for (const session of updatedPlan.sessions) {
      // Filtrar base de ejercicios por goal
      const applicability = await this.applicabilityRepo.find({
        where: {
          goal: goal as Goal,
          level: level as 'beginner' | 'intermediate' | 'advanced',
        },
        relations: ['exercise'],
      });

      const applicableExercises = applicability.map((a) => a.exercise);

      if (session.sessionType === 'recovery') {
        // Recuperación sin cambios lógicos, pero acumulado en array
        const recs = applicableExercises.filter(
          (e) => e.category === 'recovery',
        );
        recs.forEach((ex, i) =>
          exercisesToInsert.push({
            session,
            exercise: ex,
            sets: 1,
            reps: '60 segundos',
            order: i + 1,
            block: ExerciseBlock.RECOVERY,
          }),
        );
      } else {
        // Lógica main/repeat refactorizada para usar weekOneMap
        const shouldCopy =
          (level === 'beginner' ||
            ((level === 'intermediate' || level === 'advanced') &&
              goal !== Goal.HEALTH)) &&
          session.weekNumber > 1;
        let list = shouldCopy
          ? weekOneMap[session.dayNumber]
          : await this.generateExercises(
              level,
              sex,
              goal as Goal,
              session.focus,
            );
        if (!shouldCopy && session.weekNumber === 1) {
          weekOneMap[session.dayNumber] = list;
        }
        list.forEach((e, i) =>
          exercisesToInsert.push({
            session,
            exercise: e.exercise,
            sets: e.sets,
            reps: e.reps,
            order: i + 1,
            block: e.block,
          }),
        );
      }
    }

    // Bulk insert de ejercicios
    await this.exerciseRepo.save(exercisesToInsert as TrainingExercise[]);

    return plan;
  }

  /*
  Devuelve el foco principal de cada sesión dependiendo del día y frecuencia semanal
   */
  getFocusForDay(day: number, daysPerWeek: number): string[] {
    const map3 = [
      ['horizontal_push', 'horizontal_pull', 'knee_dominant'],
      ['vertical_push', 'vertical_pull', 'hip_dominant'],
      [
        'horizontal_push',
        'horizontal_pull',
        'vertical_push',
        'vertical_pull',
        'knee_dominant',
        'hip_dominant',
      ],
    ];
    const map4 = [
      ['horizontal_push', 'horizontal_pull', 'knee_dominant'],
      ['vertical_push', 'vertical_pull', 'hip_dominant'],
      ['horizontal_push', 'horizontal_pull', 'knee_dominant'],
      ['vertical_push', 'vertical_pull', 'hip_dominant'],
    ];
    const map5 = [...map4, ['Recovery']];

    if (daysPerWeek === 3) return map3[day - 1];
    if (daysPerWeek === 4) return map4[day - 1];
    return map5[day - 1];
  }

  /**
   * Elige aleatoriamente ejercicios de una lista y les asigna sets/reps y bloque
   */
  private pickExercises(
    list: Exercise[],
    count: number,
    sets: number,
    reps: string,
    block: ExerciseBlock,
  ): {
    exercise: Exercise;
    sets: number;
    reps: string;
    block: ExerciseBlock;
  }[] {
    const shuffled = list.sort(() => 0.5 - Math.random()).slice(0, count);
    return shuffled.map((ex) => ({ exercise: ex, sets, reps, block }));
  }
  /**
   * Lógica principal de generación de ejercicios personalizada según nivel, sexo, objetivo, patrón, semana y día
   */
  async generateExercises(
    level: string,
    sex: string,
    goal: Goal,
    focus: string,
  ): Promise<
    { exercise: Exercise; sets: number; reps: string; block: ExerciseBlock }[]
  > {
    const applicability = await this.applicabilityRepo.find({
      where: { goal, level: level as 'beginner' | 'intermediate' | 'advanced' },
      relations: ['exercise'],
    });

    const allExercises = Array.from(
      new Map(applicability.map((a) => [a.exercise.id, a.exercise])).values(),
    );
    const selected: {
      exercise: Exercise;
      sets: number;
      reps: string;
      block: ExerciseBlock;
    }[] = [];

    // Extrae los patrones principales de la sesión
    const focusPatterns = focus.split(',').map((f) => f.trim());

    //Establecer número de series base según nivel y objetivo
    const isFemale = sex === 'female';
    let mainSets = 3;
    let accessorySets = 3;
    let globalSets = 3;

    if (goal === 'strength') {
      mainSets = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 5;
      accessorySets =
        level === 'beginner' ? 4 : level === 'intermediate' ? 4 : 5;
    } else {
      mainSets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 4;
      accessorySets =
        level === 'beginner' ? 3 : level === 'intermediate' ? 3 : 4;
    }

    if (level === 'advanced') globalSets = 4;

    if (isFemale && level !== 'advanced') {
      mainSets++;
      accessorySets++;
      globalSets++;
    }

    const mainReps =
      goal === 'muscle_gain' ? '8-12' : goal === 'strength' ? '3-6' : '10-15';

    //BLOQUE 1 Calentamiento
    const warmups = allExercises.filter((e) => e.pattern === 'warmup');
    selected.push(
      ...this.pickExercises(warmups, 4, 2, '10-12', ExerciseBlock.WARMUP),
    );

    // BLOQUE 2: Principal (main_basic + main_complementary + core)
    // Ejercicios principales según los patrones del día y objetivo

    for (const pattern of focusPatterns) {
      const main = allExercises.filter(
        (e) => e.pattern === pattern && e.category?.includes('main_basic'),
      );

      selected.push(
        ...this.pickExercises(main, 1, mainSets, mainReps, ExerciseBlock.MAIN),
      );
    }

    // main_complementary solo si nivel avanzado
    if (level === 'advanced') {
      const complementaryCandidates = allExercises.filter(
        (e) =>
          focusPatterns.includes(e.pattern) &&
          e.category === 'main_complementary',
      );
      selected.push(
        ...this.pickExercises(
          complementaryCandidates,
          1,
          mainSets,
          mainReps,
          ExerciseBlock.MAIN,
        ),
      );
    }

    //Core, se aplica siempre. Dividido entre anti-extension y rotación (1 y 1)
    const coreAntiExtension = allExercises.filter((e) =>
      e.pattern?.startsWith('core_anti_extension'),
    );
    const coreRotation = allExercises.filter(
      (e) =>
        e.pattern?.startsWith('core_anti_rotation') ||
        e.pattern?.startsWith('core_rotation'),
    );
    selected.push(
      ...this.pickExercises(
        coreAntiExtension,
        1,
        2,
        '8-12',
        ExerciseBlock.MAIN,
      ),
    );
    selected.push(
      ...this.pickExercises(coreRotation, 1, 2, '8-12', ExerciseBlock.MAIN),
    );

    // BLOQUE 3: Global solo avanzado
    if (level === 'advanced') {
      const global = allExercises.filter((e) => e.pattern === 'global');
      selected.push(
        ...this.pickExercises(
          global,
          1,
          globalSets,
          mainReps,
          ExerciseBlock.GLOBAL,
        ),
      );
    }

    //BLOQUE 4: Complementario (accessory) + hiit si es salud
    const accessory = allExercises.filter((e) => e.category === 'accessory');

    const legPatterns = ['isolation_leg_push', 'isolation_leg_pull'];
    const armPatterns = ['isolation_arm_push', 'isolation_arm_pull'];

    const accessoryLeg = accessory.filter((e) =>
      legPatterns.includes(e.pattern),
    );
    const accessoryArm = accessory.filter((e) =>
      armPatterns.includes(e.pattern),
    );

    // Elegimos 1 pierna, 2 brazos (si no beginner)
    if (level !== 'beginner') {
      selected.push(
        ...this.pickExercises(
          accessoryLeg,
          1,
          accessorySets,
          mainReps,
          ExerciseBlock.ACCESSORY,
        ),
      );
      selected.push(
        ...this.pickExercises(
          accessoryArm,
          1,
          accessorySets,
          mainReps,
          ExerciseBlock.ACCESSORY,
        ),
      );
    } else {
      selected.push(
        ...this.pickExercises(
          accessoryLeg,
          1,
          2,
          mainReps,
          ExerciseBlock.ACCESSORY,
        ),
      );
      selected.push(
        ...this.pickExercises(
          accessoryArm,
          1,
          2,
          mainReps,
          ExerciseBlock.ACCESSORY,
        ),
      );
    }
    // HIIT solo si objetivo es salud
    if (goal === Goal.HEALTH) {
      const hiit = accessory.filter((e) => e.pattern === 'hiit');
      selected.push(
        ...this.pickExercises(hiit, 1, 3, '20s-40s', ExerciseBlock.ACCESSORY),
      );
    }

    return selected;
  }
  //devuelve el plan actual del usuario
  async getCurrentPlanForUser(user: User): Promise<TrainingPlan | null> {
    return this.planRepo.findOne({
      where: {
        user: { id: user.id },
      },
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ], // si quieres incluir sesiones
      order: { id: 'DESC' },
    });
  }
  //Devuelve todos los planes del uaurio
  async getAllPlansForUser(user: User): Promise<TrainingPlan[]> {
    return this.planRepo.find({
      where: { user: { id: user.id } },
      order: { startDate: 'DESC' },
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ],
    });
  }

  async getCurrentAndPreviousPlans(user: User): Promise<TrainingPlan[]> {
    const plans = await this.planRepo.find({
      where: {
        user: { id: user.id },
      },
      order: { startDate: 'DESC' },
      take: 2,
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ],
    });

    // 🔍 LOG para ver qué devuelve exactamente
    //console.log('📊 Planes cargados (con sesiones):', JSON.stringify(plans, null, 2));

    return plans;
  }
}
