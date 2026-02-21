import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';

import { Event } from '../events/event.model';
import { SeatCategory } from './seat.category.model';
import { BookingSeat } from '../bookings/booking-seat.model';

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BOOKED = 'BOOKED',
}

@Table({
  tableName: 'seats',
})
export class Seat extends Model<Seat> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Event)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare eventId: number;

  @BelongsTo(() => Event)
  declare event: Event;

  @ForeignKey(() => SeatCategory)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare seatCategoryId: number;

  @BelongsTo(() => SeatCategory)
  declare seatCategory: SeatCategory;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare row: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare number: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare seatLabel: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.ENUM('AVAILABLE', 'RESERVED', 'BOOKED'),
    defaultValue: SeatStatus.AVAILABLE,
  })
  declare status: SeatStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare reservedUntil: Date | null;

  @HasMany(() => BookingSeat)
  declare bookingSeats: BookingSeat[];
}
