import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const CollectorsMetricsProviders = [
  makeCounterProvider({
    name: 'collector_accepted_events',
    help: 'Total number of successful accepted events',
    labelNames: ['source'],
  }),
  makeCounterProvider({
    name: 'collector_processed_events',
    help: 'Total number of processed events',
    labelNames: ['source'],
  }),
  makeCounterProvider({
    name: 'collector_failed_events',
    help: 'Total number of failed events',
    labelNames: ['source'],
  }),
];
