import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.model';

interface AuthRequest extends ExpressRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @Post()
  createEvent(@Body() dto: CreateEventDto, @Request() req: AuthRequest) {
    return this.eventsService.createEvent(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }
}
