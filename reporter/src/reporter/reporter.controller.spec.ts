import { Test, TestingModule } from '@nestjs/testing';
import { ReporterController } from './reporter.controller';
import { ReporterService } from './reporter.service';
import { EventStatisticInput } from './dtos/get-event.statistic.input';
import { EventStatisticResponseArray } from './dtos/get-event.statistic.response';
import { GetRevenueInput } from './dtos/get-revenue.input';
import { RevenueResponse } from './dtos/get-revenue.response';
import { DemographicsSchemaInput } from './dtos/get-demographics.input';

describe('ReporterController', () => {
  let reporterController: ReporterController;

  const mockReporterService = {
    getEventStatistics: jest.fn(),
    getRevenue: jest.fn(),
    getDemographic: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReporterController],
      providers: [
        {
          provide: ReporterService,
          useValue: mockReporterService,
        },
      ],
    }).compile();

    reporterController = module.get<ReporterController>(ReporterController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reporterController).toBeDefined();
  });

  it('should call getEventStatistics and return the result', async () => {
    const query: EventStatisticInput = {
      from: '2025-05-14T00:00:00.000Z',
      to: '2025-05-14T23:59:59.999Z',
      source: 'facebook',
      funnelStage: 'top',
      eventType: 'click',
    };
    const response: EventStatisticResponseArray = [
      {
        eventType: 'click',
        source: 'facebook',
        funnelStage: 'top',
        _count: { eventType: 5 },
      },
    ];

    mockReporterService.getEventStatistics.mockResolvedValue(response);

    const result = await reporterController.getEventStatistics(query);
    expect(result).toEqual(response);
    expect(mockReporterService.getEventStatistics).toHaveBeenCalledWith(query);
  });

  it('should call getRevenueStatistics and return the result', async () => {
    const query: GetRevenueInput = {
      from: '2025-05-14T00:00:00.000Z',
      to: '2025-05-14T23:59:59.999Z',
      source: 'facebook',
      campaignId: 'camp-Mn15k',
    };

    const response: RevenueResponse = {
      purchaseAmount: 1500.5,
    };

    mockReporterService.getRevenue.mockResolvedValue(response);

    const result = await reporterController.getRevenueStatistics(query);
    expect(result).toEqual(response);
    expect(mockReporterService.getRevenue).toHaveBeenCalledWith(query);
  });

  it('should call getDemographicStatistics and return the result', async () => {
    const query: DemographicsSchemaInput = {
      from: '2025-05-14T00:00:00.000Z',
      to: '2025-05-14T23:59:59.999Z',
      source: 'facebook',
    };

    const response = [
      {
        data: {
          user: {
            age: 25,
            gender: 'male',
            location: { city: 'New York', country: 'USA' },
          },
        },
      },
    ];

    mockReporterService.getDemographic.mockResolvedValue(response);

    const result = await reporterController.getDemographicStatistics(query);
    expect(result).toEqual(response);
    expect(mockReporterService.getDemographic).toHaveBeenCalledWith(query);
  });
});
