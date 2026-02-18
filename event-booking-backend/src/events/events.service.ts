import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event, EventType } from './event.model';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  async createEvent(data: CreateEventDto, organizerId: number) {
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

    return this.eventModel.create({
      title: data.title,
      description: data.description,
      location: data.location,
      date: new Date(data.date),
      price: data.price,
      eventType: data.eventType,
      totalSeats,
      availableSeats,
      organizerId,
    });
  }

  async findAll() {
    return this.eventModel.findAll();
  }
}
