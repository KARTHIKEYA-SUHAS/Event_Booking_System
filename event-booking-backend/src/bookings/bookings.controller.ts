import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createBooking(@Body() dto: CreateBookingDto, @Request() req: AuthRequest) {
    return this.bookingsService.createBooking(req.user.userId, dto);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }
}
