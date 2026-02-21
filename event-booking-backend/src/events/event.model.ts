import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { User } from '../users/user.model';
import { CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Seat } from 'src/seats/seat.model';

export enum EventType {
  LIMITED = 'LIMITED',
  UNLIMITED = 'UNLIMITED',
}

interface EventAttributes {
  id: number;
  title: string;
  description: string;
  location: string;
  date: Date;
  price: number;
  organizerId: number;
  eventType: EventType;
  totalSeats: number | null;
  availableSeats: number | null;
}

type EventCreationAttributes = Optional<
  EventAttributes,
  'id' | 'totalSeats' | 'availableSeats'
>;

@Table({
  tableName: 'events',
})
export class Event extends Model<EventAttributes, EventCreationAttributes> {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare location: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.ENUM('LIMITED', 'UNLIMITED'),
    allowNull: false,
  })
  declare eventType: 'LIMITED' | 'UNLIMITED';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare totalSeats: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare availableSeats: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare organizerId: number;

  @BelongsTo(() => User)
  declare organizer: User;

  @HasMany(() => Seat)
  seats: Seat[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
