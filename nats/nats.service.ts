import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  connect,
  NatsConnection,
  JetStreamClient,
  StringCodec,
  AckPolicy,
  DeliverPolicy,
  ReplayPolicy,
  JetStreamManager,
} from 'nats';
import { Event } from '@common/interfaces/event.interface';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  protected nc: NatsConnection;
  protected js: JetStreamClient;
  private jsm: JetStreamManager;
  protected readonly sc = StringCodec();
  private isRunning = true;

  async onModuleInit() {
    try {
      this.nc = await connect({
        servers: 'nats://nats:4222',
      });
      this.js = this.nc.jetstream();
      this.jsm = await this.nc.jetstreamManager();
      this.logger.log('Connected to NATS');
    } catch (err) {
      this.logger.error('Failed to connect to NATS', err);
      throw err;
    }
  }

  async publishEvent(subject: string, data: Event): Promise<void> {
    try {
      await this.js.publish(subject, this.sc.encode(JSON.stringify(data)));
    } catch (err) {
      this.logger.error(
        `Failed to publish event to NATS subject: ${subject}`,
        err,
      );
    }
  }

  async subscribe(
    streamName: string,
    subject: string,
    callback: (data: Event) => Promise<void>,
    durableName: string,
  ): Promise<void> {
    try {
      await this.jsm.streams.info(streamName);
      this.logger.log(`Stream "${streamName}" found`);

      try {
        await this.jsm.consumers.add(streamName, {
          durable_name: durableName,
          ack_policy: AckPolicy.Explicit,
          deliver_policy: DeliverPolicy.All,
          replay_policy: ReplayPolicy.Instant,
          filter_subject: subject,
        });
        this.logger.log(`Consumer "${durableName}" created`);
      } catch (error) {
        this.logger.log(`Consumer "${durableName}" already exists`);
      }

      const consumer = await this.js.consumers.get(streamName, durableName);
      this.logger.log(`Consumer Info: ${JSON.stringify(consumer.info())}`);

      await (async () => {
        while (this.isRunning) {
          try {
            this.logger.log('Waiting for messages...');
            const messages = await consumer.consume();

            for await (const msg of messages) {
              if (!this.isRunning) break;

              try {
                const data = JSON.parse(this.sc.decode(msg.data)) as Event;

                await callback(data);
                msg.ack();
              } catch (err) {
                this.logger.error(`Error processing message: ${err.message}`);
              }
            }
          } catch (error) {
            this.logger.error(`Error in consumer loop: ${error}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      })();
    } catch (error) {
      this.logger.error(`Error: ${error}`);
    }
  }

  async onModuleDestroy() {
    this.isRunning = false;
    await this.nc?.drain();
    this.logger.log('NATS connection closed');
  }
}
