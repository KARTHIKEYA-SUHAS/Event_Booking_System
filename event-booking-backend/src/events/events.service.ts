import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { Event, EventType } from './event.model';
import { CreateEventDto } from './dto/create-event.dto';
import { SeatsService } from '../seats/seats.service';
import { SeatCategory } from '../seats/seat.category.model';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private eventModel: typeof Event,

    @InjectModel(SeatCategory)
    private seatCategoryModel: typeof SeatCategory,

    private readonly seatsService: SeatsService,
    private readonly sequelize: Sequelize,
  ) {}

  async createEvent(data: CreateEventDto, organizerId: number) {
    const transaction = await this.sequelize.transaction();

    try {
      let totalSeats: number | null = null;
      let availableSeats: number | null = null;

      if (data.eventType === EventType.LIMITED) {
        if (!data.totalSeats || data.totalSeats <= 0) {
          throw new Error('totalSeats must be provided for LIMITED events');
        }

        totalSeats = data.totalSeats;
        availableSeats = data.totalSeats;
      }

      if (data.eventType === EventType.UNLIMITED) {
        totalSeats = null;
        availableSeats = null;
      }

      // 1️⃣ Create Event
      const event = await this.eventModel.create(
        {
          title: data.title,
          description: data.description,
          location: data.location,
          date: new Date(data.date),
          price: data.price,
          eventType: data.eventType,
          totalSeats,
          availableSeats,
          organizerId,
        },
        { transaction },
      );

      // 2️⃣ If LIMITED → Generate Seats
      if (data.eventType === EventType.LIMITED) {
        const seatCategories = await this.seatCategoryModel.findAll({
          where: { eventId: event.id },
          transaction,
        });

        await this.seatsService.generateSeatsForEvent(
          event,
          seatCategories,
          transaction,
        );
      }

      await transaction.commit();
      return event;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll() {
    return this.eventModel.findAll();
  }
}
