import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, JetStreamManager, RetentionPolicy, StorageType } from 'nats';
import {
  FACEBOOK_STREAM_NAME,
  FACEBOOK_SUBJECT,
  TIKTOK_STREAM_NAME,
  TIKTOK_SUBJECT,
} from '@common/constants';

@Injectable()
export class JetStreamService implements OnModuleInit {
  private readonly logger = new Logger(JetStreamService.name);

  async onModuleInit() {
    try {
      const nc = await connect({
        servers: 'nats://nats:4222',
      });
      const jsm: JetStreamManager = await nc.jetstreamManager();

      await this.createStream(jsm, FACEBOOK_STREAM_NAME, [FACEBOOK_SUBJECT]);
      await this.createStream(jsm, TIKTOK_STREAM_NAME, [TIKTOK_SUBJECT]);

      await nc.close();
    } catch (error) {
      this.logger.error('Failed to initialize JetStream', error);
    }
  }

  private async createStream(
    jsm: JetStreamManager,
    name: string,
    subjects: string[],
  ) {
    try {
      await jsm.streams.add({
        name,
        subjects,
        retention: RetentionPolicy.Limits,
        storage: StorageType.File,
        max_msgs: -1,
        max_bytes: -1,
        max_age: 0,
      });
      this.logger.log(`Stream "${name}" created`);
    } catch (err: any) {
      this.logger.error(`Error creating stream "${name}"`, err);
    }
  }
}
