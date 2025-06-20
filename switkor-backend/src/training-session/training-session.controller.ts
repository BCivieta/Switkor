import { Controller, Get, Param, UseGuards, Patch } from '@nestjs/common';
import { TrainingSessionService } from './training-session.service';
import { AuthGuard } from '@nestjs/passport';
import { NotFoundException } from '@nestjs/common';

@Controller('session')
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getSessionById(@Param('id') id: number) {
    const session = await this.trainingSessionService.getSessionById(
      Number(id),
    );
    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }
    return session;
  }
  @Patch(':id/complete')
  async completeSession(@Param('id') id: string) {
    return this.trainingSessionService.markComplete(+id);
  }
}
