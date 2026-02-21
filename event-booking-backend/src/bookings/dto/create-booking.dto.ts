import {
  IsArray,
  IsNumber,
  ArrayNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  eventId: number;

  // For LIMITED events (frontend sends seat labels like "A3", "B2")
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  seatLabels?: string[];

  // For UNLIMITED events
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
