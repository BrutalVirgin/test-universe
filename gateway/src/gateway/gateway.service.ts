import { Injectable, Logger } from '@nestjs/common';
import { Event } from '@common/interfaces/event.interface';
import { NatsService } from '../../../nats/nats.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly publisher: NatsService,
    @InjectMetric('gateway_accepted_events')
    private readonly acceptedCounter: Counter<string>,
    @InjectMetric('gateway_processed_events')
    private readonly processedCounter: Counter<string>,
    @InjectMetric('gateway_failed_events')
    private readonly failedCounter: Counter<string>,
  ) {}

  async publishToNats(events: Event[]): Promise<void> {
    this.acceptedCounter.inc(events.length);

    for (const event of events) {
      try {
        switch (event.source) {
          case 'facebook':
          case 'tiktok':
            break;
          default:
            this.logger.warn(`Unknown source. Skipping event.`);
            continue;
        }
        await this.publisher.publishEvent(`events.${event.source}`, event);

        this.logger.log(
          `TRACE_ID ${event.eventId}: event published to events.${event.source}`,
        );

        this.processedCounter.inc();
      } catch (err) {
        this.failedCounter.inc();

        this.logger.error(
          `TRACE_ID ${event.eventId}: Failed to publish event to events.${event.source}}`,
        );
      }
    }
  }
}
