import { z } from 'zod';

export const EventStatisticResponseSchema = z.object({
  _count: z.object({
    eventType: z.number(),
  }),
  eventType: z.string(),
  source: z.string(),
  funnelStage: z.string(),
});

export const EventStatisticResponseArraySchema = z.array(
  EventStatisticResponseSchema,
);
export type EventStatisticResponseArray = z.infer<
  typeof EventStatisticResponseArraySchema
>;
