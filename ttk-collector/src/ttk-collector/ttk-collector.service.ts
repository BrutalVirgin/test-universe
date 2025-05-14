import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NatsService } from '../../../nats/nats.service';
import { Event } from '@common/interfaces/event.interface';
import { PrismaService } from '../../../prisma';
import {
  TIKTOK_DURABLE_NAME,
  TIKTOK_STREAM_NAME,
  TIKTOK_SUBJECT,
} from '@common/constants';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class TtkCollectorService implements OnModuleInit {
  private readonly logger = new Logger(TtkCollectorService.name);

  constructor(
    private readonly natsService: NatsService,
    private readonly prismaService: PrismaService,
    @InjectMetric('collector_accepted_events')
    private readonly acceptedCounter: Counter<'source'>,
    @InjectMetric('collector_processed_events')
    private readonly processedCounter: Counter<'source'>,
    @InjectMetric('collector_failed_events')
    private readonly failedCounter: Counter<'source'>,
  ) {}

  async onModuleInit() {
    await this.natsService.subscribe(
      TIKTOK_STREAM_NAME,
      TIKTOK_SUBJECT,
      async (event) => {
        await this.processEvent(event);
      },
      TIKTOK_DURABLE_NAME,
    );
    this.logger.log('Subscribed to events_facebook stream for fb_event');
  }

  private async processEvent(event: Event) {
    this.acceptedCounter.inc({ source: event.source });

    try {
      const data = await this.prismaService.saveEvent(event);

      this.logger.log(
        `TRACE_ID ${event.eventId}: saved event: ${JSON.stringify(data)}`,
      );

      this.processedCounter.inc({ source: event.source });
    } catch (err) {
      this.failedCounter.inc({ source: event.source });
      this.logger.error(
        `TRACE_ID ${event.eventId}: Failed to process event ${event.eventId}`,
      );
      throw err;
    }
  }
}
