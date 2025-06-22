import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { TrainingPlanService } from './training-plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { AuthenticatedRequest } from '../types/express';

@Controller('plan')
export class TrainingPlanController {
  constructor(private readonly trainingPlanService: TrainingPlanService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(@Body() dto: CreatePlanDto, @CurrentUser() user: User) {
    return this.trainingPlanService.createPlan(dto, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('current')
  async getCurrent(@CurrentUser() user: User) {
    return this.trainingPlanService.getCurrentPlanForUser(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAllPlans(@CurrentUser() user: User) {
    return this.trainingPlanService.getAllPlansForUser(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/current-and-previous')
  async getCurrentAndPreviousPlans(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.trainingPlanService.getCurrentAndPreviousPlans(user);
  }
}
