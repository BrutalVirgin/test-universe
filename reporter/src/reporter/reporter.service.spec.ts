import { Test, TestingModule } from '@nestjs/testing';
import { ReporterService } from './reporter.service';
import { ReporterRepository } from './repositories';
import { EventStatisticInput } from './dtos/get-event.statistic.input';
import { GetRevenueInput } from './dtos/get-revenue.input';
import { DemographicsSchemaInput } from './dtos/get-demographics.input';

describe('ReporterService', () => {
  let service: ReporterService;

  const mockHistogram = {
    startTimer: jest.fn().mockReturnValue(() => {}),
  };

  const mockRepository = {
    getEventStatistics: jest.fn(),
    getRevenueData: jest.fn(),
    getDemographicData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReporterService,
        {
          provide: ReporterRepository,
          useValue: mockRepository,
        },
        {
          provide: 'reports_latency_seconds',
          useValue: mockHistogram,
        },
      ],
    }).compile();

    service = module.get<ReporterService>(ReporterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventStatistics', () => {
    it('should fetch event statistics with correct filters', async () => {
      const query: EventStatisticInput = {
        from: '2025-05-01',
        to: '2025-05-10',
        source: 'facebook',
        funnelStage: 'top',
        eventType: 'checkout.complete',
      };

      const mockData = [
        { eventType: 'checkout.complete', _count: { eventType: 5 } },
      ];
      mockRepository.getEventStatistics.mockResolvedValue(mockData);

      const result = await service.getEventStatistics(query);

      expect(mockRepository.getEventStatistics).toHaveBeenCalledWith({
        timestamp: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
        funnelStage: query.funnelStage,
        source: query.source,
        eventType: query.eventType,
      });

      expect(result).toEqual(mockData);
    });
  });

  describe('getRevenue', () => {
    it('should fetch revenue data with correct filters', async () => {
      const query: GetRevenueInput = {
        from: '2025-05-01',
        to: '2025-05-10',
        source: 'facebook',
        campaignId: 'camp-1234',
      };

      const mockData = { purchaseAmount: 1000 };
      mockRepository.getRevenueData.mockResolvedValue(mockData);

      const result = await service.getRevenue(query);

      expect(mockRepository.getRevenueData).toHaveBeenCalledWith({
        timestamp: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
        source: query.source,
        data: { engagement: { campaignId: query.campaignId } },
      });

      expect(result).toEqual(mockData);
    });
  });

  describe('getDemographic', () => {
    it('should fetch demographic data with correct filters', async () => {
      const query: DemographicsSchemaInput = {
        from: '2025-05-01',
        to: '2025-05-10',
        source: 'facebook',
      };

      const mockData = [
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

      mockRepository.getDemographicData.mockResolvedValue(mockData);

      const result = await service.getDemographic(query);

      expect(mockRepository.getDemographicData).toHaveBeenCalledWith({
        timestamp: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
        source: query.source,
      });

      expect(result).toEqual(mockData);
    });
  });
});
