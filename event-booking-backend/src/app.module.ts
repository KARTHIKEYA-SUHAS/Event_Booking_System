import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { SeatsModule } from './seats/seats.module';

import { User } from './users/user.model';
import { Event } from './events/event.model';
import { Booking } from './bookings/booking.model';
import { Seat } from './seats/seat.model';
import { BookingSeat } from './bookings/booking-seat.model';
import { SeatCategory } from './seats/seat.category.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'Event_Booking_System',
      models: [User, Event, Booking, BookingSeat, Seat, SeatCategory], // ✅ include Seat here
      autoLoadModels: true,
      sync: {
        alter: true,
      },
    }),

    AuthModule,
    UsersModule,
    EventsModule,
    BookingsModule,
    SeatsModule, // ✅ Only module here
  ],
})
export class AppModule {}
