import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma';
import { NatsModule } from '../../../nats/nats.module';
import { FbCollectorService } from './fb-collector.service';
import { MetricsModule } from '../../../prometheus';

@Module({
  imports: [PrismaModule, NatsModule, MetricsModule],
  providers: [FbCollectorService],
})
export class FbCollectorModule {}
