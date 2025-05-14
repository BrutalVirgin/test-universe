import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import { JetStreamService } from './jetstream.service';

@Module({
  providers: [NatsService, JetStreamService],
  exports: [NatsService],
})
export class NatsModule {}
