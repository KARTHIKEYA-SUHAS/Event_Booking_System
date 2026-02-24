import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Booking, BookingStatus } from './booking.model';
import { BookingSeat } from './booking-seat.model';
import { Event } from '../events/event.model';
import { Seat } from '../seats/seat.model';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SeatStatus } from '../seats/seat.model';
import { Sequelize } from 'sequelize-typescript';
import { Payment, PaymentStatus } from '../payments/payment.model';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking)
    private bookingModel: typeof Booking,

    @InjectModel(Event)
    private eventModel: typeof Event,

    @InjectModel(Seat)
    private seatModel: typeof Seat,

    @InjectModel(BookingSeat)
    private bookingSeatModel: typeof BookingSeat,
    private sequelize: Sequelize,

    @InjectModel(Payment)
    private paymentModel: typeof Payment,
  ) {}

  /* ---------------- CREATE BOOKING ---------------- */

  async createBooking(dto: CreateBookingDto, userId: number) {
    const event = await this.eventModel.findByPk(dto.eventId);
    if (!event) throw new NotFoundException('Event not found');

    if (event.eventType === 'LIMITED') {
      if (!dto.seatLabels || dto.seatLabels.length === 0) {
        throw new BadRequestException('seatLabels required for LIMITED events');
      }

      const transaction = await this.bookingModel.sequelize!.transaction();

      try {
        const seats = await this.seatModel.findAll({
          where: {
            seatLabel: dto.seatLabels,
            eventId: event.id,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (seats.length !== dto.seatLabels.length) {
          throw new BadRequestException('One or more seats not found');
        }

        const now = new Date();

        for (const seat of seats) {
          if (seat.status === SeatStatus.BOOKED) {
            throw new BadRequestException(
              `Seat ${seat.seatLabel} already booked`,
            );
          }

          if (seat.status === SeatStatus.RESERVED) {
            if (!seat.reservedUntil || seat.reservedUntil > now) {
              throw new BadRequestException(
                `Seat ${seat.seatLabel} currently reserved`,
              );
            }

            seat.status = SeatStatus.AVAILABLE;
            seat.reservedUntil = null;
            await seat.save({ transaction });
          }
        }

        const reservedUntil = new Date(Date.now() + 15 * 60 * 1000);

        for (const seat of seats) {
          seat.status = SeatStatus.RESERVED;
          seat.reservedUntil = reservedUntil;
          await seat.save({ transaction });
        }

        const totalPrice = seats.reduce((sum, s) => sum + s.price, 0);

        const booking = await this.bookingModel.create(
          {
            userId,
            eventId: event.id,
            totalPrice,
            status: BookingStatus.PENDING,
          },
          { transaction },
        );

        for (const seat of seats) {
          await this.bookingSeatModel.create(
            {
              bookingId: booking.id,
              seatId: seat.id,
            },
            { transaction },
          );
        }

        await transaction.commit();

        return {
          bookingId: booking.id,
          status: booking.status,
          totalPrice,
          seatLabels: seats.map((s) => s.seatLabel),
          reservedUntil,
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    if (event.eventType === 'UNLIMITED') {
      if (!dto.quantity || dto.quantity <= 0) {
        throw new BadRequestException('Quantity required for UNLIMITED events');
      }

      const totalPrice = event.price * dto.quantity;

      const booking = await this.bookingModel.create({
        userId,
        eventId: event.id,
        quantity: dto.quantity,
        totalPrice,
        status: BookingStatus.PENDING,
      });

      return {
        bookingId: booking.id,
        status: booking.status,
        quantity: booking.quantity,
        totalPrice,
      };
    }
  }

  /* ---------------- CONFIRM BOOKING ---------------- */

  async confirmBooking(bookingId: number, userId: number) {
    const transaction = await this.bookingModel.sequelize!.transaction();

    try {
      const booking = await this.bookingModel.findByPk(bookingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.userId !== userId)
        throw new ForbiddenException('Unauthorized');
      if (booking.status !== BookingStatus.PENDING)
        throw new BadRequestException('Only pending bookings can be confirmed');

      const bookingSeats = await this.bookingSeatModel.findAll({
        where: { bookingId },
        transaction,
      });

      const seatIds = bookingSeats.map((bs) => bs.seatId);

      const seats = await this.seatModel.findAll({
        where: { id: seatIds },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const now = new Date();

      for (const seat of seats) {
        if (!seat.reservedUntil || seat.reservedUntil < now) {
          booking.status = BookingStatus.EXPIRED;
          await booking.save({ transaction });
          await transaction.commit();

          throw new BadRequestException(
            'Reservation expired. Booking marked as EXPIRED',
          );
        }

        seat.status = SeatStatus.BOOKED;
        seat.reservedUntil = null;
        await seat.save({ transaction });
      }

      booking.status = BookingStatus.CONFIRMED;
      await booking.save({ transaction });

      await transaction.commit();

      return {
        bookingId: booking.id,
        status: booking.status,
        seatLabels: seats.map((s) => s.seatLabel),
        totalPrice: booking.totalPrice,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /* ---------------- GET BOOKING ---------------- */

  async getBookingById(bookingId: number, userId: number) {
    const booking = await this.bookingModel.findByPk(bookingId, {
      include: [
        {
          model: BookingSeat,
          include: [Seat],
        },
        {
          model: Event,
        },
      ],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Unauthorized');

    const now = new Date();

    // 🔥 AUTO EXPIRE LOGIC
    if (booking.status === BookingStatus.PENDING) {
      const seats = booking.bookingSeats?.map((bs) => bs.seat) ?? [];

      const isExpired = seats.some(
        (seat) => !seat?.reservedUntil || seat.reservedUntil < now,
      );

      if (isExpired) {
        // Update seats back to AVAILABLE
        for (const seat of seats) {
          if (seat) {
            seat.status = SeatStatus.AVAILABLE;
            seat.reservedUntil = null;
            await seat.save();
          }
        }

        booking.status = BookingStatus.EXPIRED;
        await booking.save();
      }
    }

    const seatLabels: string[] =
      booking.bookingSeats?.map((bs) => bs.seat?.seatLabel ?? '') ?? [];

    return {
      bookingId: booking.id,
      status: booking.status,
      totalPrice: booking.totalPrice,
      event: booking.event
        ? {
            id: booking.event.id,
            title: booking.event.title,
            date: booking.event.date,
          }
        : null,
      seatLabels,
    };
  }

  /* ---------------- PAY BOOKING ---------------- */

  async payBooking(bookingId: number, userId: number) {
    return await this.sequelize.transaction(async (transaction) => {
      const booking = await this.bookingModel.findByPk(bookingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new ForbiddenException('Unauthorized');
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Booking cannot be paid');
      }

      const existingPayment = await this.paymentModel.findOne({
        where: {
          bookingId: booking.id,
          status: PaymentStatus.SUCCESS,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existingPayment) {
        throw new BadRequestException('Booking already paid');
      }
      // 1️⃣ Create payment record (PENDING)
      const payment: Payment = await this.paymentModel.create(
        {
          bookingId: booking.id,
          amount: booking.totalPrice,
          status: PaymentStatus.PENDING,
          transactionRef: `TXN-${Date.now()}`,
        },
        { transaction },
      );

      // 2️⃣ Simulate payment success
      const paymentSuccessful = true;

      if (!paymentSuccessful) {
        payment.status = PaymentStatus.FAILED;
        await payment.save({ transaction });
        throw new BadRequestException('Payment failed');
      }

      // 3️⃣ Update payment to SUCCESS
      payment.status = PaymentStatus.SUCCESS;
      await payment.save({ transaction });

      // 4️⃣ Confirm booking
      const confirmed = await this.confirmBooking(bookingId, userId);

      return {
        bookingId: confirmed.bookingId,
        status: confirmed.status,
        seatLabels: confirmed.seatLabels,
        totalPrice: confirmed.totalPrice,
        paymentId: payment.id,
        transactionRef: payment.transactionRef,
      };
    });
  }
  async cancelBooking(bookingId: number, userId: number, userRole: string) {
    return await this.sequelize.transaction(async (transaction) => {
      // 1️⃣ Lock ONLY booking row
      const booking = await this.bookingModel.findByPk(bookingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.userId !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenException(
          'You are not allowed to cancel this booking',
        );
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BadRequestException(
          'Only confirmed bookings can be cancelled',
        );
      }

      // 2️⃣ Fetch event separately (no lock needed)
      const event = await this.eventModel.findByPk(booking.eventId, {
        transaction,
      });

      // 3️⃣ If LIMITED → release seats
      if (event?.eventType === 'LIMITED') {
        const bookingSeats = await this.bookingSeatModel.findAll({
          where: { bookingId: booking.id },
          transaction,
        });

        const seatIds = bookingSeats.map((bs) => bs.seatId);

        const seats = await this.seatModel.findAll({
          where: { id: seatIds },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        for (const seat of seats) {
          seat.status = SeatStatus.AVAILABLE;
          seat.reservedUntil = null;
          await seat.save({ transaction });
        }
      }

      booking.status = BookingStatus.CANCELLED;
      await booking.save({ transaction });

      return {
        bookingId: booking.id,
        status: booking.status,
        message: 'Booking cancelled successfully',
      };
    });
  }
}
