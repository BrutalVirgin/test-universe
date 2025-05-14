import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { NatsModule } from '../../../nats/nats.module';
import { MetricsModule } from '../../../prometheus';

@Module({
  imports: [NatsModule, MetricsModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
