import { z } from 'zod';

export const GetRevenueSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  source: z.string().optional(),
  campaignId: z.string().optional(),
});

export type GetRevenueInput = z.infer<typeof GetRevenueSchema>;
