import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './event.model';
import { SeatsModule } from 'src/seats/seats.module';
import { SeatCategory } from 'src/seats/seat.category.model';

@Module({
  imports: [SequelizeModule.forFeature([Event, SeatCategory]), SeatsModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
