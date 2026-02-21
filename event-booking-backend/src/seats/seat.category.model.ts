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
import { Event } from '../events/event.model';
import { Seat } from './seat.model';

/* ---------- ATTRIBUTES ---------- */

export enum SeatCategoryType {
  VIP = 'VIP',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
}

interface SeatCategoryAttributes {
  id: number;
  eventId: number;
  categoryType: SeatCategoryType;
  price: number;
  rowCount: number;
  seatsPerRow: number;
  startingRowLetter: string;
}

type SeatCategoryCreationAttributes = Optional<SeatCategoryAttributes, 'id'>;

/* ---------- MODEL ---------- */

@Table({
  tableName: 'seat_categories',
})
export class SeatCategory extends Model<
  SeatCategoryAttributes,
  SeatCategoryCreationAttributes
> {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
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

  @Column({
    type: DataType.ENUM('VIP', 'GOLD', 'SILVER'),
    allowNull: false,
  })
  declare categoryType: SeatCategoryType;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rowCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare seatsPerRow: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare startingRowLetter: string;

  @HasMany(() => Seat)
  seats: Seat[];
}
