import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DrillsService } from './drills.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('drills')
export class DrillsController {
  constructor(private drills: DrillsService) {}

  @Get()
  async list(@Query() query: any) {
    return this.drills.list({
      category: query.category,
      ageGroup: query.ageGroup,
      difficulty: query.difficulty,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.drills.get(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() body: any) {
    return this.drills.create(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.drills.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.drills.remove(id);
  }
}
