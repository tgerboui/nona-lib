import { z } from 'zod';

export const BlockCount = z.object({
  count: z.string(),
  unchecked: z.string(),
  cemented: z.string(),
});

export type BlockCount = z.infer<typeof BlockCount>;
