import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  eventId: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  seatNumber?: string;
}
