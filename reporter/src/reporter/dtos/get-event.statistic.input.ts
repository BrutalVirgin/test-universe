import { z } from 'zod';

export const EventStatisticSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  source: z.string().optional(),
  funnelStage: z.string().optional(),
  eventType: z.string().optional(),
});

export type EventStatisticInput = z.infer<typeof EventStatisticSchema>;
