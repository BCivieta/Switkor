import { Controller, Get, Param, UseGuards, Patch, Req, ParseIntPipe  } from '@nestjs/common';
import { TrainingSessionService } from './training-session.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../types/express';

@UseGuards(AuthGuard('jwt'))
@Controller('session')
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  
  @Get('history')
  async getUserCompletedSessions(@Req() req: AuthenticatedRequest) {
    return this.trainingSessionService.getCompletedSessionsByUser(req.user.id);
  }

  
  @Get(':id')
  async getSessionById(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest)  {
    return this.trainingSessionService.getSessionById(
      id,
      req.user.id
    );
  }
  
  @Patch(':id/complete')
  async completeSession(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.trainingSessionService.markComplete(id, req.user.id);
  }
}