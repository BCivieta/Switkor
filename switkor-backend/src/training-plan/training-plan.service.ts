// src/training-plan/training-plan.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  private toGoalEnum(goal: string): Goal {
    switch (goal) {
      case 'muscle_gain':
        return Goal.MUSCLE_GAIN;
      case 'strength':
        return Goal.STRENGTH;
      case 'health':
        return Goal.HEALTH;
      default:
        throw new Error(`Invalid goal: ${goal}`);
    }
  }

  async createPlan(dto: CreatePlanDto, user: User): Promise<TrainingPlan> {
    try {
      const { level, sex, goal, daysPerWeek } = dto;
      const parsedGoal = this.toGoalEnum(goal);
      const today = new Date();
      const startDate = isMonday(today)
        ? today
        : addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
      const endDate = addDays(startDate, 27);

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

      const plan = this.planRepo.create({
        user,
        goal: parsedGoal,
        level,
        sex,
        daysPerWeek,
        startDate,
        endDate,
      });
      await this.planRepo.save(plan);

      const dayOffsetsMap = {
        3: [0, 2, 4],
        4: [0, 1, 3, 5],
        5: [0, 1, 3, 5, 6],
      };
      const sessionsToInsert: Partial<TrainingSession>[] = [];

      for (let week = 1; week <= 4; week++) {
        for (let dayIdx = 0; dayIdx < daysPerWeek; dayIdx++) {
          const offset = dayOffsetsMap[daysPerWeek][dayIdx];
          const date = addDays(startDate, (week - 1) * 7 + offset);
          sessionsToInsert.push({
            trainingPlan: plan,
            date,
            weekNumber: week,
            dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'long' }),
            dayNumber: dayIdx + 1,
            focus: this.getFocusForDay(dayIdx + 1, daysPerWeek).join(','),
            sessionType:
              daysPerWeek === 5 && dayIdx === 4 ? 'recovery' : 'main',
          });
        }
      }

      const { generatedMaps } = await this.sessionRepo
        .createQueryBuilder()
        .insert()
        .into(TrainingSession)
        .values(sessionsToInsert)
        .returning('*')
        .execute();

      const savedSessions = generatedMaps as TrainingSession[];
      const exercisesToInsert: Partial<TrainingExercise>[] = [];
      const weekOneMap: Record<
        number,
        {
          exercise: Exercise;
          sets: number;
          reps: string;
          block: ExerciseBlock;
        }[]
      > = {};

      for (const session of savedSessions) {
        const allApplicabilities = await this.applicabilityRepo.find({
          where: { goal: parsedGoal },
          relations: ['exercise'],
        });

        const filteredExercises = allApplicabilities
          .filter((app) => app.level === level)
          .map((app) => app.exercise);

        if (!filteredExercises.length) {
          throw new Error(
            `No hay ejercicios disponibles para el objetivo ${goal} y nivel ${level}`,
          );
        }

        if (session.sessionType === 'recovery') {
          const recs = filteredExercises.filter(
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
          const shouldCopy =
            (level === 'beginner' ||
              ((level === 'intermediate' || level === 'advanced') &&
                parsedGoal !== Goal.HEALTH)) &&
            session.weekNumber > 1;

          const list =
            shouldCopy && weekOneMap[session.dayNumber]
              ? weekOneMap[session.dayNumber]
              : await this.generateExercises(
                  level,
                  sex,
                  parsedGoal,
                  session.focus,
                  filteredExercises,
                  plan.daysPerWeek,
                  session.dayNumber,
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

      await this.exerciseRepo.save(exercisesToInsert as TrainingExercise[]);

      return plan;
    } catch (error) {
      console.error('Error al crear el plan:', error);
      throw new InternalServerErrorException(
        'No se pudo crear el plan de entrenamiento',
      );
    }
  }

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

  private async generateExercises(
    level: string,
    sex: string,
    goal: Goal,
    focus: string,
    baseList: Exercise[],
    daysPerWeek?: number,
    dayNumber?: number,
  ): Promise<
    { exercise: Exercise; sets: number; reps: string; block: ExerciseBlock }[]
  > {
    try {
      const selected: {
        exercise: Exercise;
        sets: number;
        reps: string;
        block: ExerciseBlock;
      }[] = [];
      const focusPatterns = focus.split(',').map((f) => f.trim());
      const isFemale = sex === 'female';
      let mainSets = 3;
      let accessorySets = 3;
      let globalSets = 3;

      if (goal === Goal.STRENGTH) {
        mainSets = level === 'beginner' ? 4 : 5;
        accessorySets = level === 'beginner' ? 4 : 5;
      } else {
        mainSets = level === 'beginner' ? 3 : 4;
        accessorySets = level === 'beginner' ? 3 : 4;
      }

      if (level === 'advanced') globalSets = 4;
      if (isFemale && level !== 'advanced') {
        mainSets++;
        accessorySets++;
        globalSets++;
      }

      const mainReps =
        goal === Goal.MUSCLE_GAIN
          ? '8-12'
          : goal === Goal.STRENGTH
            ? '3-6'
            : '10-15';

      const warmups = baseList.filter((e) => e.pattern === 'warmup');
      selected.push(
        ...this.pickExercises(warmups, 4, 2, '10-12', ExerciseBlock.WARMUP),
      );

      for (const pattern of focusPatterns) {
        const main = baseList.filter(
          (e) => e.pattern === pattern && e.category?.includes('main_basic'),
        );
        selected.push(
          ...this.pickExercises(
            main,
            1,
            mainSets,
            mainReps,
            ExerciseBlock.MAIN,
          ),
        );
      }

      if (level === 'advanced') {
        const complementary = baseList.filter(
          (e) =>
            focusPatterns.includes(e.pattern) &&
            e.category === 'main_complementary',
        );
        selected.push(
          ...this.pickExercises(
            complementary,
            1,
            mainSets,
            mainReps,
            ExerciseBlock.MAIN,
          ),
        );
      }

      const coreAntiExtension = baseList.filter((e) =>
        e.pattern?.startsWith('core_anti_extension'),
      );
      const coreRotation = baseList.filter(
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

      if (level === 'advanced') {
        const global = baseList.filter((e) => e.pattern === 'global');
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

      const accessory = baseList.filter((e) => e.category === 'accessory');
      const legPatterns = ['isolation_leg_push', 'isolation_leg_pull'];
      const armPatterns = ['isolation_arm_push', 'isolation_arm_pull'];
      const accessoryLeg = accessory.filter((e) =>
        legPatterns.includes(e.pattern),
      );
      const accessoryArm = accessory.filter((e) =>
        armPatterns.includes(e.pattern),
      );

      // Omitir bloque ACCESSORY si es el día 3 de un plan de 3 días/semana
      const skipAccessory = daysPerWeek === 3 && dayNumber === 3;

      if (!skipAccessory){

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
      }

      if (goal === Goal.HEALTH) {
        const hiit = accessory.filter((e) => e.pattern === 'hiit');
        selected.push(
          ...this.pickExercises(hiit, 1, 3, '20s-40s', ExerciseBlock.ACCESSORY),
        );
      }

      return selected;
    } catch (error) {
      console.error('Error en generateExercises:', error);
      throw new InternalServerErrorException(
        'No se pudieron generar ejercicios',
      );
    }
  }

  private pickExercises(
    list: Exercise[],
    count: number,
    sets: number,
    reps: string,
    block: ExerciseBlock,
  ) {
    const shuffled = list.sort(() => 0.5 - Math.random()).slice(0, count);
    return shuffled.map((ex) => ({ exercise: ex, sets, reps, block }));
  }

  async getCurrentPlanForUser(user: User): Promise<TrainingPlan | null> {
    return this.planRepo.findOne({
      where: { user: { id: user.id } },
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ],
      order: { id: 'DESC' },
    });
  }

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
    return this.planRepo.find({
      where: { user: { id: user.id } },
      order: { id: 'DESC' },
      take: 2,
      relations: [
        'sessions',
        'sessions.exercises',
        'sessions.exercises.exercise',
      ],
    });
  }
}
