import { Test, TestingModule } from '@nestjs/testing';
import { GatewayService } from './gateway.service';
import { NatsService } from '../../../nats/nats.service';
import { Event } from '@common/interfaces/event.interface';

describe('GatewayService', () => {
  let gatewayService: GatewayService;

  const mockNatsService = {
    publishEvent: jest.fn(),
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
        GatewayService,
        {
          provide: NatsService,
          useValue: mockNatsService,
        },
        {
          provide: 'gateway_accepted_events',
          useValue: mockAcceptedCounter,
        },
        {
          provide: 'gateway_processed_events',
          useValue: mockProcessedCounter,
        },
        {
          provide: 'gateway_failed_events',
          useValue: mockFailedCounter,
        },
      ],
    }).compile();

    gatewayService = module.get<GatewayService>(GatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gatewayService).toBeDefined();
  });

  it('should publish events to NATS and increment counters', async () => {
    const event: Event[] = [
      {
        eventId: 'fb-3e8f395a-661a-4dc5-b868-1b571b78e33f',
        timestamp: '2025-05-14T10:46:28.214Z',
        source: 'facebook',
        funnelStage: 'bottom',
        eventType: 'checkout.complete',
        data: {
          user: {
            age: 57,
            name: 'Henry Auer',
            gender: 'non-binary',
            userId: 'dcc79054-7a44-458d-b8a1-b01ee0ba5db6',
            location: {
              city: 'Lorenland',
              country: 'Mongolia',
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
      },
    ];

    await gatewayService.publishToNats(event);

    expect(mockAcceptedCounter.inc).toHaveBeenCalledWith(event.length);
    expect(mockNatsService.publishEvent).toHaveBeenCalledTimes(2);
    expect(mockProcessedCounter.inc).toHaveBeenCalledTimes(2);
  });

  it('should log a warning for unknown event source', async () => {
    const events = [
      {
        eventId: 'fb-3e8f395a-661a-4dc5-b868-1b571b78e33f',
        timestamp: '2025-05-14T10:46:28.214Z',
        source: 'unknown',
        funnelStage: 'bottom',
        eventType: 'checkout.complete',
        data: {
          user: {
            age: 57,
            name: 'Henry Auer',
            gender: 'non-binary',
            userId: 'dcc79054-7a44-458d-b8a1-b01ee0ba5db6',
            location: {
              city: 'Lorenland',
              country: 'Mongolia',
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
      },
    ];

    await gatewayService.publishToNats(events as any);

    expect(mockNatsService.publishEvent).not.toHaveBeenCalled();
    expect(mockAcceptedCounter.inc).toHaveBeenCalledWith(1);
    expect(mockProcessedCounter.inc).not.toHaveBeenCalled();
  });
});
