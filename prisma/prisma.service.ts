import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async saveEvent(event: any) {
    return this.event.upsert({
      where: { eventId: event.eventId },
      update: {
        timestamp: event.timestamp,
        source: event.source,
        funnelStage: event.funnelStage,
        eventType: event.eventType,
        data: JSON.parse(JSON.stringify(event.data)),
      },
      create: {
        eventId: event.eventId,
        timestamp: event.timestamp,
        source: event.source,
        funnelStage: event.funnelStage,
        eventType: event.eventType,
        data: JSON.parse(JSON.stringify(event.data)),
      },
    });
  }
}
