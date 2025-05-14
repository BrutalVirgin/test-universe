import { makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const ReportsMetricsProviders = [
  makeHistogramProvider({
    name: 'reports_latency_seconds',
    help: 'Latency of report generation by category',
    labelNames: ['request'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),
];
