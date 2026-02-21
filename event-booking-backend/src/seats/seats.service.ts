import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

import { Seat, SeatStatus } from './seat.model';
import { SeatCategory } from './seat.category.model';
import { Event } from '../events/event.model';
import { CreateSeatCategoryDto } from './dto/create-seat-category.dto';
import { Booking, BookingStatus } from '../bookings/booking.model';

@Injectable()
export class SeatsService {
  constructor(
    @InjectModel(Seat)
    private seatModel: typeof Seat,

    @InjectModel(Booking)
    private bookingModel: typeof Booking,

    @InjectModel(SeatCategory)
    private seatCategoryModel: typeof SeatCategory,
  ) {}

  async generateSeatsForEvent(
    event: Event,
    seatCategories: SeatCategory[],
    transaction: Transaction,
  ) {
    const lastSeat = await this.seatModel.findOne({
      where: { eventId: event.id },
      order: [['row', 'DESC']],
      transaction,
    });

    let currentRowCharCode = 65; // default A

    if (lastSeat) {
      currentRowCharCode = lastSeat.row.charCodeAt(0) + 1;
    }

    const seatsToCreate: any[] = [];

    for (const category of seatCategories) {
      for (let i = 0; i < category.rowCount; i++) {
        const rowLetter = String.fromCharCode(currentRowCharCode);

        for (
          let seatNumber = 1;
          seatNumber <= category.seatsPerRow;
          seatNumber++
        ) {
          seatsToCreate.push({
            eventId: event.id,
            seatCategoryId: category.id,
            row: rowLetter,
            number: seatNumber,
            seatLabel: `${rowLetter}${seatNumber}`,
            price: category.price,
            status: SeatStatus.AVAILABLE,
            reservedUntil: null,
          });
        }

        currentRowCharCode++;
      }
    }

    await this.seatModel.bulkCreate(seatsToCreate, { transaction });
  }

  async createSeatCategory(data: CreateSeatCategoryDto) {
    const transaction = await this.seatModel.sequelize!.transaction();

    try {
      const category = await this.seatCategoryModel.create(
        {
          eventId: data.eventId,
          categoryType: data.categoryType,
          price: data.price,
          rowCount: data.rowCount,
          seatsPerRow: data.seatsPerRow,
          startingRowLetter: data.startingRowLetter,
        },
        { transaction },
      );

      const event = await Event.findByPk(data.eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      await this.generateSeatsForEvent(event, [category], transaction);

      await transaction.commit();

      return category;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getSeatsForEvent(eventId: number) {
    const now = new Date();

    const seats = await this.seatModel.findAll({
      where: { eventId },
      include: [SeatCategory],
      order: [
        ['row', 'ASC'],
        ['number', 'ASC'],
      ],
    });

    const rowsMap: Record<string, any[]> = {};
    const categoriesMap: Record<
      string,
      {
        price: number;
        available: number;
        booked: number;
        reserved: number;
      }
    > = {};

    for (const seat of seats) {
      // Auto-expire RESERVED seats
      if (
        seat.status === SeatStatus.RESERVED &&
        seat.reservedUntil &&
        seat.reservedUntil < now
      ) {
        // Find related booking
        const bookingSeat = await seat.$get('bookingSeats');

        if (bookingSeat && bookingSeat.length > 0) {
          const bookingId = bookingSeat[0].bookingId;

          const booking = await this.bookingModel.findByPk(bookingId);

          if (booking && booking.status === BookingStatus.PENDING) {
            booking.status = BookingStatus.EXPIRED;
            await booking.save();
          }
        }

        // Release seat
        seat.status = SeatStatus.AVAILABLE;
        seat.reservedUntil = null;
        await seat.save();
      }

      // Build rows
      if (!rowsMap[seat.row]) {
        rowsMap[seat.row] = [];
      }

      rowsMap[seat.row].push({
        id: seat.id,
        seatLabel: seat.seatLabel,
        number: seat.number,
        price: seat.price,
        status: seat.status,
        category: seat.seatCategory?.categoryType,
      });

      // Build category summary
      const categoryType = seat.seatCategory?.categoryType;
      const categoryPrice = seat.seatCategory?.price;

      if (categoryType && categoryPrice !== undefined) {
        if (!categoriesMap[categoryType]) {
          categoriesMap[categoryType] = {
            price: categoryPrice,
            available: 0,
            booked: 0,
            reserved: 0,
          };
        }

        if (seat.status === SeatStatus.AVAILABLE) {
          categoriesMap[categoryType].available++;
        }

        if (seat.status === SeatStatus.BOOKED) {
          categoriesMap[categoryType].booked++;
        }

        if (seat.status === SeatStatus.RESERVED) {
          categoriesMap[categoryType].reserved++;
        }
      }
    }

    const rows = Object.keys(rowsMap).map((row) => ({
      row,
      seats: rowsMap[row],
    }));

    const categories = Object.keys(categoriesMap).map((type) => ({
      type,
      ...categoriesMap[type],
    }));

    return {
      eventId,
      categories,
      rows,
    };
  }
}
