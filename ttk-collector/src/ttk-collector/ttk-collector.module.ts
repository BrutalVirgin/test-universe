import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { NatsModule } from '../../../nats/nats.module';
import { TtkCollectorService } from './ttk-collector.service';
import { MetricsModule } from '../../../prometheus';

@Module({
  imports: [PrismaModule, NatsModule, MetricsModule],
  providers: [TtkCollectorService],
})
export class TtkCollectorModule {}
