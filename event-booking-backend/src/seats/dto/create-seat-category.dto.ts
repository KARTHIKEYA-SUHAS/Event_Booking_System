import { IsNumber, IsEnum, IsString } from 'class-validator';
import { SeatCategoryType } from '../seat.category.model';

export class CreateSeatCategoryDto {
  @IsNumber()
  eventId: number;

  @IsEnum(SeatCategoryType)
  categoryType: SeatCategoryType;

  @IsNumber()
  price: number;

  @IsNumber()
  rowCount: number;

  @IsNumber()
  seatsPerRow: number;

  @IsString()
  startingRowLetter: string;
}
