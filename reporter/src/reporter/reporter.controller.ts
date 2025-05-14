import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ReporterService } from './reporter.service';
import { ZodValidationPipe } from './pipes/zod-validation-pipe';
import {
  EventStatisticInput,
  EventStatisticSchema,
} from './dtos/get-event.statistic.input';
import { EventStatisticResponseArray } from './dtos/get-event.statistic.response';
import { GetRevenueInput, GetRevenueSchema } from './dtos/get-revenue.input';
import { RevenueResponse } from './dtos/get-revenue.response';
import { DemographicsSchemaInput } from './dtos/get-demographics.input';

@Controller('reports')
export class ReporterController {
  constructor(private readonly reporterService: ReporterService) {}

  @Get('/events')
  @UsePipes(new ZodValidationPipe(EventStatisticSchema))
  async getEventStatistics(
    @Query() query: EventStatisticInput,
  ): Promise<EventStatisticResponseArray> {
    return this.reporterService.getEventStatistics(query);
  }

  @Get('/revenue')
  @UsePipes(new ZodValidationPipe(GetRevenueSchema))
  async getRevenueStatistics(
    @Query() query: GetRevenueInput,
  ): Promise<RevenueResponse> {
    return this.reporterService.getRevenue(query);
  }

  @Get('/demographics')
  async getDemographicStatistics(@Query() query: DemographicsSchemaInput) {
    return this.reporterService.getDemographic(query);
  }
}
