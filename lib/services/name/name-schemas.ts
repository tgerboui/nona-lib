import { z } from 'zod';

export const NameInfo = z.object({
  key: z.string(),
});

export type NameInfo = z.infer<typeof NameInfo>;
