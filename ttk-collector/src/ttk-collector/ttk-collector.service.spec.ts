import { Test, TestingModule } from '@nestjs/testing';
import { TtkCollectorService } from './ttk-collector.service';
import { NatsService } from '../../../nats/nats.service';
import { PrismaService } from '../../../prisma';
import {
  TIKTOK_DURABLE_NAME,
  TIKTOK_STREAM_NAME,
  TIKTOK_SUBJECT,
} from '@common/constants';
import { Event } from '@common/interfaces/event.interface';

describe('TtkCollectorService', () => {
  let service: TtkCollectorService;

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
        TtkCollectorService,
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

    service = module.get<TtkCollectorService>(TtkCollectorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe to NATS on module init', async () => {
    await service.onModuleInit();
    expect(mockNatsService.subscribe).toHaveBeenCalledWith(
      TIKTOK_STREAM_NAME,
      TIKTOK_SUBJECT,
      expect.any(Function),
      TIKTOK_DURABLE_NAME,
    );
  });

  it('should process event and increment counters', async () => {
    const event: Event = {
      eventId: 'ttk-3e8f395a-661a-4dc5-b868-1b571b78e33f',
      timestamp: '2025-05-14T10:46:28.214Z',
      source: 'tiktok',
      funnelStage: 'bottom',
      eventType: 'purchase',
      data: {
        user: {
          userId: 'dcc79054-7a44-458d-b8a1-b01ee0ba5db6',
          username: 'henry_auer',
          followers: 1234,
        },
        engagement: {
          actionTime: '2025-05-14T10:46:28.214Z',
          profileId: 'prof-123',
          purchasedItem: 'Cool Shirt',
          purchaseAmount: '59.99',
        },
      },
    };

    mockPrismaService.saveEvent.mockResolvedValue(event);

    await service['processEvent'](event);

    expect(mockAcceptedCounter.inc).toHaveBeenCalledWith({ source: 'tiktok' });
    expect(mockPrismaService.saveEvent).toHaveBeenCalledWith(event);
    expect(mockProcessedCounter.inc).toHaveBeenCalledWith({ source: 'tiktok' });
  });

  it('should increment failed counter and log error if processing fails', async () => {
    const event: Event = {
      eventId: 'ttk-3e8f395a-661a-4dc5-b868-1b571b78e33f',
      timestamp: '2025-05-14T10:46:28.214Z',
      source: 'tiktok',
      funnelStage: 'bottom',
      eventType: 'purchase',
      data: {
        user: {
          userId: 'dcc79054-7a44-458d-b8a1-b01ee0ba5db6',
          username: 'henry_auer',
          followers: 1234,
        },
        engagement: {
          actionTime: '2025-05-14T10:46:28.214Z',
          profileId: 'prof-123',
          purchasedItem: 'Cool Shirt',
          purchaseAmount: '59.99',
        },
      },
    };

    mockPrismaService.saveEvent.mockRejectedValue(new Error('DB Error'));

    await expect(service['processEvent'](event)).rejects.toThrow('DB Error');
    expect(mockFailedCounter.inc).toHaveBeenCalledWith({ source: 'tiktok' });
  });
});
