import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { ReporterService } from './reporter.service';
import { ReporterController } from './reporter.controller';
import { ReporterRepository } from './repositories';
import { MetricsModule } from '../../../prometheus';

@Module({
  imports: [PrismaModule, MetricsModule],
  controllers: [ReporterController],
  providers: [ReporterService, ReporterRepository],
})
export class ReporterModule {}
