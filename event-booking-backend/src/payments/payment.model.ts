import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Booking } from '../bookings/booking.model';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/* ================= ATTRIBUTES ================= */

export interface PaymentAttributes {
  id: number;
  bookingId: number;
  amount: number;
  status: PaymentStatus;
  transactionRef: string | null;
}

export type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  'id' | 'transactionRef'
>;

/* ================= MODEL ================= */

@Table({
  tableName: 'payments',
})
export class Payment extends Model<
  PaymentAttributes,
  PaymentCreationAttributes
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

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  declare status: PaymentStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare transactionRef: string | null;
}
