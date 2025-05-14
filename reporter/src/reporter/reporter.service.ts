import { Injectable } from '@nestjs/common';
import { EventStatisticInput } from './dtos/get-event.statistic.input';
import { ReporterRepository } from './repositories';
import {
  EventFilters,
  RevenueFilters,
} from '@common/interfaces/event.interface';
import { EventStatisticResponseArray } from './dtos/get-event.statistic.response';
import { GetRevenueInput } from './dtos/get-revenue.input';
import { RevenueResponse } from './dtos/get-revenue.response';
import { DemographicsSchemaInput } from './dtos/get-demographics.input';
import { Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class ReporterService {
  constructor(
    private readonly reporterRepository: ReporterRepository,
    @InjectMetric('reports_latency_seconds')
    private readonly reportsHistogram: Histogram<string>,
  ) {}

  async getEventStatistics(
    query: EventStatisticInput,
  ): Promise<EventStatisticResponseArray> {
    const { from, to, source, funnelStage, eventType } = query;
    const filters: EventFilters = {
      timestamp: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
      ...(funnelStage && { funnelStage }),
      ...(source && { source }),
      ...(eventType && { eventType }),
    };

    const end = this.reportsHistogram.startTimer({
      request: 'getEventStatistics',
    });

    const result = await this.reporterRepository.getEventStatistics(filters);

    end();

    return result;
  }

  async getRevenue(query: GetRevenueInput): Promise<RevenueResponse> {
    const filters: RevenueFilters = {
      timestamp: {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      },
      ...(query.source && { source: query.source as 'facebook' | 'tiktok' }),
      ...(query.campaignId && {
        data: { engagement: { campaignId: query.campaignId } },
      }),
    };

    const end = this.reportsHistogram.startTimer({
      request: 'getRevenue',
    });

    const result = await this.reporterRepository.getRevenueData(filters);

    end();

    return result;
  }

  async getDemographic(query: DemographicsSchemaInput) {
    const { from, to, source } = query;

    const filters = {
      timestamp: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
      source,
    };

    const end = this.reportsHistogram.startTimer({
      request: 'getDemographic',
    });

    const result = await this.reporterRepository.getDemographicData(filters);

    end();

    return result;
  }
}
