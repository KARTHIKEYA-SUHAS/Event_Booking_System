import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { EventType } from '../event.model';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsDateString()
  date: string;

  @IsNumber()
  price: number;

  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsNumber()
  totalSeats?: number;
}
