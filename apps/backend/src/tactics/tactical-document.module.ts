import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TacticalDocumentController } from './tactical-document.controller';
import { TacticalDocumentService } from './tactical-document.service';

@Module({
  imports: [PrismaModule],
  controllers: [TacticalDocumentController],
  providers: [TacticalDocumentService],
})
export class TacticalDocumentModule {}
