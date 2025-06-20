import { Controller, Get, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { TrainingSessionService } from './training-session.service';
import { AuthGuard } from '@nestjs/passport';
import { NotFoundException } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/express';

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

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getUserCompletedSessions(@Req() req: AuthenticatedRequest) {
    return this.trainingSessionService.getCompletedSessionsByUser(req.user.id);
  }
}