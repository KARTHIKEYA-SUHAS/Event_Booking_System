import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /* CREATE BOOKING */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.bookingsService.createBooking(dto, req.user.userId);
  }

  /* GET SINGLE BOOKING */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getBooking(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.bookingsService.getBookingById(Number(id), req.user.userId);
  }

  /* PAY BOOKING */
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/pay')
  payBooking(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: number } },
  ) {
    return this.bookingsService.payBooking(Number(id), req.user.userId);
  }
}
