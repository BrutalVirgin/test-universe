import { Controller, Post, Body } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post()
  async handleWebhook(@Body() payload: any) {
    console.log('Received webhook event:', payload);

    // await this.gatewayService.publishToNats(payload);

    return { status: 'Event received and published to NATS' };
  }
}
