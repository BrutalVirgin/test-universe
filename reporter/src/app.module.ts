import { Module } from '@nestjs/common';
import { ReporterModule } from './reporter/reporter.module';

@Module({
  imports: [ReporterModule],
})
export class AppModule {}
