import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

describe('GatewayController', () => {
  let gatewayController: GatewayController;

  const mockGatewayService = {
    publishToNats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: GatewayService,
          useValue: mockGatewayService,
        },
      ],
    }).compile();

    gatewayController = module.get<GatewayController>(GatewayController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gatewayController).toBeDefined();
  });

  it('should call publishToNats and return success message', async () => {
    const payload = [{ eventId: '123', source: 'facebook' }];
    const result = await gatewayController.handleWebhook(payload);

    expect(mockGatewayService.publishToNats).toHaveBeenCalledWith(payload);
    expect(result).toEqual({
      status: 'Event received and published to NATS',
    });
  });
});
