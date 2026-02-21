import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Seat } from './seat.model';
import { SeatCategory } from './seat.category.model';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { Booking } from 'src/bookings/booking.model';

@Module({
  imports: [SequelizeModule.forFeature([Seat, SeatCategory, Booking])],
  providers: [SeatsService],
  controllers: [SeatsController],
  exports: [SeatsService],
})
export class SeatsModule {}
