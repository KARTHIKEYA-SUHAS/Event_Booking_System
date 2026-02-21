import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { CreateSeatCategoryDto } from './dto/create-seat-category.dto';

@Controller()
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  // Create seat category
  @Post('seat-categories')
  async createSeatCategory(@Body() body: CreateSeatCategoryDto) {
    return this.seatsService.createSeatCategory(body);
  }

  // Get seat layout for an event
  @Get('events/:id/seats')
  async getSeats(@Param('id') id: string) {
    return this.seatsService.getSeatsForEvent(Number(id));
  }
}
