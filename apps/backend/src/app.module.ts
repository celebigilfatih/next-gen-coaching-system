import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DrillsModule } from './drills/drills.module';
import { TrainingPlansModule } from './training-plans/training-plans.module';
import { ClubsModule } from './clubs/clubs.module';
import { GroupsModule } from './groups/groups.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventsModule } from './events/events.module';
import { SeasonsModule } from './seasons/seasons.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DrillsModule,
    TrainingPlansModule,
    ClubsModule,
    GroupsModule,
    AttendanceModule,
    EventsModule,
    SeasonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
