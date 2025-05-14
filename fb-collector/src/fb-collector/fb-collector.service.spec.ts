import { Test, TestingModule } from '@nestjs/testing';
import { FbCollectorService } from './fb-collector.service';
import { NatsService } from '../../../nats/nats.service';
import { PrismaService } from '../../../prisma';
import {
  FACEBOOK_DURABLE_NAME,
  FACEBOOK_STREAM_NAME,
  FACEBOOK_SUBJECT,
} from '@common/constants';
import { Event } from '@common/interfaces/event.interface';

describe('FbCollectorService', () => {
  let service: FbCollectorService;

  const mockNatsService = {
    subscribe: jest.fn(),
  };

  const mockPrismaService = {
    saveEvent: jest.fn(),
  };

  const mockAcceptedCounter = {
    inc: jest.fn(),
  };

  const mockProcessedCounter = {
    inc: jest.fn(),
  };

  const mockFailedCounter = {
    inc: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FbCollectorService,
        {
          provide: NatsService,
          useValue: mockNatsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'collector_accepted_events',
          useValue: mockAcceptedCounter,
        },
        {
          provide: 'collector_processed_events',
          useValue: mockProcessedCounter,
        },
        {
          provide: 'collector_failed_events',
          useValue: mockFailedCounter,
        },
      ],
    }).compile();

    service = module.get<FbCollectorService>(FbCollectorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe to NATS service on module init', async () => {
    await service.onModuleInit();

    expect(mockNatsService.subscribe).toHaveBeenCalledWith(
      FACEBOOK_STREAM_NAME,
      FACEBOOK_SUBJECT,
      expect.any(Function),
      FACEBOOK_DURABLE_NAME,
    );
  });

  it('should process event and increment counters', async () => {
    const event: Event = {
      eventId: 'fb-123',
      timestamp: '2025-05-14T12:00:00.000Z',
      source: 'facebook',
      funnelStage: 'bottom',
      eventType: 'checkout.complete',
      data: {
        user: {
          age: 25,
          name: 'test',
          gender: 'non-binary',
          userId: 'dcc79054-7a44-458d-b8a1-b01ee0ba5db6',
          location: {
            city: 'New York',
            country: 'USA',
          },
        },
        engagement: {
          adId: 'ad-DPFSHszH',
          device: 'desktop',
          browser: 'Firefox',
          campaignId: 'camp-Mn15k',
          clickPosition: 'center',
          purchaseAmount: '414.29',
        },
      },
    };

    mockPrismaService.saveEvent.mockResolvedValue(event);

    await service['processEvent'](event);

    expect(mockAcceptedCounter.inc).toHaveBeenCalledWith({
      source: 'facebook',
    });
    expect(mockPrismaService.saveEvent).toHaveBeenCalledWith(event);
    expect(mockProcessedCounter.inc).toHaveBeenCalledWith({
      source: 'facebook',
    });
  });

  it('should increment failed counter if error occurs', async () => {
    const event: Event = {
      eventId: 'fb-123',
      timestamp: '2025-05-14T12:00:00.000Z',
      source: 'facebook',
      funnelStage: 'bottom',
      eventType: 'checkout.complete',
      data: {
        user: {
          age: 25,
          name: 'test',
          gender: 'non-binary',
          userId: 'dcc79054-7a44-458d-b8a1-b01ee0ba5db6',
          location: {
            city: 'New York',
            country: 'USA',
          },
        },
        engagement: {
          adId: 'ad-DPFSHszH',
          device: 'desktop',
          browser: 'Firefox',
          campaignId: 'camp-Mn15k',
          clickPosition: 'center',
          purchaseAmount: '414.29',
        },
      },
    };

    mockPrismaService.saveEvent.mockRejectedValue(new Error('Database error'));

    await expect(service['processEvent'](event)).rejects.toThrow(
      'Database error',
    );

    expect(mockAcceptedCounter.inc).toHaveBeenCalledWith({
      source: 'facebook',
    });
    expect(mockFailedCounter.inc).toHaveBeenCalledWith({ source: 'facebook' });
  });
});
