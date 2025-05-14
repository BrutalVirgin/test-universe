import { z } from 'zod';

export const DemographicsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  source: z.enum(['facebook', 'tiktok']).optional(),
});

export type DemographicsSchemaInput = z.infer<typeof DemographicsSchema>;
