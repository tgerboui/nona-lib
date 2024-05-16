import { z } from 'zod';

export const WorkGenerate = z.object({
  work: z.string(),
  difficulty: z.string(),
  multiplier: z.string(),
  hash: z.string(),
});

export type WorkGenerate = z.infer<typeof WorkGenerate>;
