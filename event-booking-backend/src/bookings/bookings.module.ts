import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Booking } from './booking.model';
import { Event } from '../events/event.model';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingSeat } from './booking-seat.model';
import { Seat } from 'src/seats/seat.model';

@Module({
  imports: [SequelizeModule.forFeature([Booking, Event, Seat, BookingSeat])],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
