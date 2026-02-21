import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Booking } from './booking.model';
import { Seat } from '../seats/seat.model';

@Table({
  tableName: 'booking_seats',
})
export class BookingSeat extends Model<
  BookingSeat,
  { bookingId: number; seatId: number }
> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare bookingId: number;

  @BelongsTo(() => Booking)
  declare booking: Booking;

  @ForeignKey(() => Seat)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true,
  })
  declare seatId: number;

  @BelongsTo(() => Seat)
  declare seat: Seat;
}
