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
  ) {}

  //Crea un plan de entrenamiento de 4 semanas
  //con sesiones generadas por semana y día según los parámetros del usuario.

  async createPlan(dto: CreatePlanDto, user: User): Promise<TrainingPlan> {
    const { level, sex, goal, daysPerWeek } = dto;

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
        date: MoreThanOrEqual(new Date()),
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
    const dayOffsetsMap = {
      3: [0, 2, 4], // Lunes, Miércoles, Viernes
      4: [0, 1, 3, 5], // Lunes, Martes, Jueves, Sábado
      5: [0, 1, 3, 5, 6], // Lunes, Martes, Jueves, Sábado, Domingo
    };

    const dayOffsets = dayOffsetsMap[daysPerWeek];

    // Creamos un mapa para guardar los ejercicios de la semana 1
    const weekOneExercisesMap: Record<
      number,
      { exercise: Exercise; sets: number; reps: string; block: ExerciseBlock }[]
    > = {};

    for (let week = 1; week <= 4; week++) {
      for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex++) {
        const offset = dayOffsets[dayIndex];
        const sessionDate = addDays(startDate, (week - 1) * 7 + offset);

        const session = this.sessionRepo.create({
          trainingPlan: plan,
          date: sessionDate,
          weekNumber: week,
          dayOfWeek: sessionDate.toLocaleDateString('en-US', {
            weekday: 'long',
          }),
          dayNumber: dayIndex + 1,
          focus: this.getFocusForDay(dayIndex + 1, daysPerWeek),
          sessionType:
            daysPerWeek === 5 && dayIndex === 4 ? 'recovery' : 'main',
        });

        await this.sessionRepo.save(session);

        if (session.sessionType === 'main') {
          let exercises;

          // Copiar los ejercicios de la semana 1 si el nivel es beginner,
          // o si es intermediate/advanced y el objetivo no es salud
          const shouldCopyWeekOne =
            (level === 'beginner' ||
              ((level === 'intermediate' || level === 'advanced') &&
                goal !== 'health')) &&
            week > 1;

          if (shouldCopyWeekOne) {
            // Clonamos los ejercicios guardados de la semana 1 para este día
            exercises = weekOneExercisesMap[dayIndex];
          } else {
            // Generamos nuevos ejercicios
            exercises = await this.generateExercises(
              level,
              sex,
              goal,
              session.focus,
              week,
              dayIndex + 1,
            );
            if (week === 1) {
              // Guardamos los ejercicios generados de la semana 1 para este día
              weekOneExercisesMap[dayIndex] = exercises;
            }
          }

          for (let i = 0; i < exercises.length; i++) {
            const ex = this.exerciseRepo.create({
              session,
              exercise: exercises[i].exercise,
              sets: exercises[i].sets,
              reps: exercises[i].reps,
              order: i + 1,
              block: exercises[i].block,
            });
            await this.exerciseRepo.save(ex);
          }
        }
      }
    }

    return plan;
  }

  /*
  Devuelve el foco principal de cada sesión dependiendo del día y frecuencia semanal
   */
  getFocusForDay(day: number, daysPerWeek: number): string {
    const map3 = [
      'Horizontal push/pull + Knee dominant',
      'Vertical push/pull + Hip dominant',
      'Full body + Core',
    ];
    const map4 = [
      'Horizontal push/pull + Knee dominant',
      'Vertical push/pull + Hip dominant',
      'Horizontal push/pull + Knee dominant',
      'Vertical push/pull + Hip dominant',
    ];
    const map5 = [...map4, 'Recovery'];

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
    goal: string,
    focus: string,
    week: number,
    day: number,
  ): Promise<
    { exercise: Exercise; sets: number; reps: string; block: ExerciseBlock }[]
  > {
    const allExercises = await this.baseExerciseRepo.find();
    const selected: {
      exercise: Exercise;
      sets: number;
      reps: string;
      block: ExerciseBlock;
    }[] = [];

    // Extrae los patrones principales de la sesión
    const focusPatterns = focus
      .toLowerCase()
      .split('+')
      .map((f) => f.trim());

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

    if (isFemale) {
      mainSets++;
      accessorySets++;
      globalSets++;
    }

    // Calentamiento
    const warmups = allExercises.filter((e) => e.pattern === 'warmup');
    selected.push(
      ...this.pickExercises(warmups, 2, 2, '10-12', ExerciseBlock.WARMUP),
    );

    // Ejercicios principales según los patrones del día y objetivo
    const mainReps =
      goal === 'muscle_gain' ? '8-12' : goal === 'strength' ? '3-6' : '10-15';
    for (const pattern of focusPatterns) {
      const main = allExercises.filter(
        (e) => e.pattern === pattern && e.category?.includes('main_basic'),
      );
      selected.push(
        ...this.pickExercises(main, 2, mainSets, mainReps, ExerciseBlock.MAIN),
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
        ExerciseBlock.CORE,
      ),
    );
    selected.push(
      ...this.pickExercises(coreRotation, 1, 2, '8-12', ExerciseBlock.CORE),
    );

    // Cardio/HIIT solo para objetivo de salud
    if (goal === 'health') {
      const hiit = allExercises.filter((e) => e.pattern === 'hiit');
      selected.push(
        ...this.pickExercises(hiit, 1, 3, '20s-40s', ExerciseBlock.HIIT),
      );
    }

    // Global solo si es nivel avanzado
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
    // Ejercicios main_complementary según el nivel (intermedios: 2, avanzados: 3)
    const complementary = allExercises.filter(
      (e) => e.category === 'main_complementary',
    );
    const pushPatterns = [
      'horizontal_push',
      'vertical_push',
      'isolation_arm_push',
    ];
    const pullPatterns = [
      'horizontal_pull',
      'vertical_pull',
      'isolation_arm_pull',
    ];
    const complementaryFiltered = complementary.filter((e) => {
      if (day % 2 === 0) {
        return pullPatterns.includes(e.pattern);
      } else {
        return pushPatterns.includes(e.pattern);
      }
    });
    const complementaryCount =
      level === 'advanced' ? 3 : level === 'intermediate' ? 2 : 0;
    if (complementaryCount > 0) {
      selected.push(
        ...this.pickExercises(
          complementaryFiltered,
          complementaryCount,
          mainSets,
          mainReps,
          ExerciseBlock.ACCESSORY,
        ),
      );
    }
    // Accesorios para todos salvo principiantes
    const accessory = allExercises.filter((e) => e.category === 'accessory');
    selected.push(
      ...this.pickExercises(
        accessory,
        1,
        accessorySets,
        mainReps,
        ExerciseBlock.ACCESSORY,
      ),
    );

    return selected;
  }
  //devuelve el plan actual del usuario
  async getCurrentPlanForUser(user: User): Promise<TrainingPlan | null> {
    return this.planRepo.findOne({
      where: {
        user: { id: user.id },
        endDate: MoreThanOrEqual(new Date()),
      },
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ], // si quieres incluir sesiones
      order: { startDate: 'DESC' },
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
}
export enum ExerciseBlock {
  WARMUP = 'warmup',
  MAIN = 'main',
  CORE = 'core',
  ACCESSORY = 'accessory',
  GLOBAL = 'global',
  HIIT = 'hiit',
}
