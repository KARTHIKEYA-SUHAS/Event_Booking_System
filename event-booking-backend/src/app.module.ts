import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.model';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { Event } from './events/event.model';
import { Booking } from './bookings/booking.model';
import { SeatCategory } from './events/seat.category.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'Event_Booking_System',
      models: [User, Event, Booking, SeatCategory], // ✅ FIXED
      autoLoadModels: true,
      sync: {
        alter: true,
      },
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    BookingsModule,
    SeatCategory,
  ],
})
export class AppModule {}
