import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { User } from '../users/user.model';
import { Event } from '../events/event.model';
import { HasMany } from 'sequelize-typescript';
import { BookingSeat } from './booking-seat.model';

/* ---------- ENUM ---------- */

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/* ---------- ATTRIBUTES ---------- */

interface BookingAttributes {
  id: number;
  userId: number;
  eventId: number;
  quantity?: number; // Used for UNLIMITED events
  seatNumber?: string; // Used for LIMITED events
  totalPrice: number;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'status'>;

/* ---------- MODEL ---------- */

@Table({
  tableName: 'bookings',
})
export class Booking extends Model<
  BookingAttributes,
  BookingCreationAttributes
> {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  /* ---------- USER RELATION ---------- */

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  /* ---------- EVENT RELATION ---------- */

  @ForeignKey(() => Event)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare eventId: number;

  @BelongsTo(() => Event)
  declare event: Event;

  /* ---------- BOOKING DATA ---------- */

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare quantity: number;

  @Column({
    type: DataType.ENUM(...Object.values(BookingStatus)),
    allowNull: false,
    defaultValue: BookingStatus.PENDING,
  })
  declare status: BookingStatus;

  @HasMany(() => BookingSeat)
  declare bookingSeats: BookingSeat[]; // Only for UNLIMITED events

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare totalPrice: number;
}
