import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Event } from '../events/event.model';
import { Optional } from 'sequelize';

interface BookingAttributes {
  id: number;
  userId: number;
  eventId: number;
  quantity: number;
  seats?: string[]; // For limited events
}

type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'seats'>;

@Table({ tableName: 'bookings' })
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare userId: number;

  @ForeignKey(() => Event)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare eventId: number;

  @Column({
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  declare seats: string[];

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Event)
  declare event: Event;
}
