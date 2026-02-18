import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Booking } from './booking.model';
import { Event } from '../events/event.model';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [SequelizeModule.forFeature([Booking, Event])],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
