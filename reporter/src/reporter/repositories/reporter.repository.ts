import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma';
import {
  EventFilters,
  RevenueFilters,
} from '@common/interfaces/event.interface';
import { EventStatisticResponseArray } from '../dtos/get-event.statistic.response';
import { RevenueResponse } from '../dtos/get-revenue.response';

@Injectable()
export class ReporterRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getEventStatistics(
    filters: EventFilters,
  ): Promise<EventStatisticResponseArray> {
    const results = await this.prismaService.event.groupBy({
      by: ['eventType', 'source', 'funnelStage'],
      _count: {
        eventType: true,
      },
      where: {
        AND: [
          filters.source ? { source: filters.source } : {},
          filters.funnelStage ? { funnelStage: filters.funnelStage } : {},
          filters.timestamp ? { timestamp: filters.timestamp } : {},
          filters.eventType ? { eventType: filters.eventType } : {},
        ],
      },
      orderBy: {
        eventType: 'asc',
      },
    });

    return results.map((result) => ({
      _count: { eventType: result._count.eventType },
      eventType: result.eventType,
      source: result.source as 'facebook' | 'tiktok',
      funnelStage: result.funnelStage as 'top' | 'bottom',
    }));
  }

  async getRevenueData(filter: RevenueFilters): Promise<RevenueResponse> {
    const events = await this.prismaService.event.findMany({
      where: {
        source: filter.source,
        timestamp: filter.timestamp,
        AND: filter.data?.engagement?.campaignId
          ? [
              {
                data: {
                  path: ['engagement', 'campaignId'],
                  equals: filter.data?.engagement?.campaignId,
                },
              },
            ]
          : [],
        data: {
          path: ['engagement', 'purchaseAmount'],
          not: { equals: null },
        },
      },
      select: {
        data: true,
      },
    });

    const totalPurchaseAmount = events.reduce((sum, event) => {
      if (
        event.data &&
        typeof event.data === 'object' &&
        'engagement' in event.data
      ) {
        const engagement = (event.data as Record<string, any>).engagement;
        const purchaseAmount = parseFloat(engagement?.purchaseAmount ?? 0);
        return sum + (isNaN(purchaseAmount) ? 0 : purchaseAmount);
      }
      return sum;
    }, 0);

    return {
      purchaseAmount: parseFloat(totalPurchaseAmount.toFixed(2)),
    };
  }

  async getDemographicData(filters: EventFilters) {
    const events = await this.prismaService.event.findMany({
      where: {
        AND: [
          filters.source ? { source: filters.source } : {},
          filters.timestamp ? { timestamp: filters.timestamp } : {},
        ],
      },
    });

    return events
      .map((event) => {
        if (event.source === 'facebook') {
          return this.mapToFacebookEvent(event);
        } else if (event.source === 'tiktok') {
          return this.mapToTiktokEvent(event);
        }
        return undefined;
      })
      .filter((event) => event !== undefined);
  }

  private mapToFacebookEvent(event: any) {
    return {
      data: {
        user: {
          age: event.data?.user?.age,
          gender: event.data?.user?.gender,
          location: event.data?.user?.location,
        },
      },
    };
  }

  private mapToTiktokEvent(event: any) {
    return {
      data: {
        user: {
          followers: event.data?.user?.followers,
          username: event.data?.user?.username,
        },
      },
    };
  }
}
