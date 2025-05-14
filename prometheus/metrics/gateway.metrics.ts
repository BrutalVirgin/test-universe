import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const GatewaysMetricsProviders = [
  makeCounterProvider({
    name: 'gateway_accepted_events',
    help: 'Total number of successful accepted events',
  }),
  makeCounterProvider({
    name: 'gateway_processed_events',
    help: 'Total number of processed events',
  }),
  makeCounterProvider({
    name: 'gateway_failed_events',
    help: 'Total number of failed events',
  }),
];
