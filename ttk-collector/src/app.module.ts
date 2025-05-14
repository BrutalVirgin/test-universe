import { Module } from '@nestjs/common';
import { TtkCollectorModule } from './ttk-collector/ttk-collector.module';

@Module({
  imports: [TtkCollectorModule],
})
export class AppModule {}
