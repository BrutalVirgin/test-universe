import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CollectorsMetricsProviders } from './metrics/collector.metrics';
import { GatewaysMetricsProviders } from './metrics/gateway.metrics';
import { ReportsMetricsProviders } from './metrics/reporter.metrics';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    ...CollectorsMetricsProviders,
    ...GatewaysMetricsProviders,
    ...ReportsMetricsProviders,
  ],
  exports: [
    ...CollectorsMetricsProviders,
    ...GatewaysMetricsProviders,
    ...ReportsMetricsProviders,
  ],
})
export class MetricsModule {}
