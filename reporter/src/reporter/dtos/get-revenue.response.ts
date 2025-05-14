import { z } from 'zod';

export const RevenueResponseSchema = z.object({
  purchaseAmount: z.number(),
});

export type RevenueResponse = z.infer<typeof RevenueResponseSchema>;
