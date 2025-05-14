import { Module } from '@nestjs/common';
import { FbCollectorModule } from './fb-collector/fb-collector.module';

@Module({
  imports: [FbCollectorModule],
  controllers: [],
})
export class AppModule {}
