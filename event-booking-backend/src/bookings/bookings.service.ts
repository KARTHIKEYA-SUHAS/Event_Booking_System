import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Booking } from './booking.model';
import { Event } from '../events/event.model';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking)
    private bookingModel: typeof Booking,

    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  async createBooking(userId: number, dto: CreateBookingDto) {
    const event = await this.eventModel.findByPk(dto.eventId);

    if (!event) throw new BadRequestException('Event not found');

    // LIMITED EVENT
    if (event.eventType === 'LIMITED') {
      if (!dto.seatNumber)
        throw new BadRequestException('Seat number required');

      return this.bookingModel.create({
        userId,
        eventId: dto.eventId,
        seatNumber: dto.seatNumber,
        totalPrice: event.price,
      });
    }

    // UNLIMITED EVENT
    if (!dto.quantity) throw new BadRequestException('Quantity required');

    return this.bookingModel.create({
      userId,
      eventId: dto.eventId,
      quantity: dto.quantity,
      totalPrice: event.price * dto.quantity,
    });
  }

  async findAll() {
    return this.bookingModel.findAll();
  }
}
