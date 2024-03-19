import { z } from 'zod';

export const Keys = z.object({
  private: z.string(),
  public: z.string(),
  account: z.string(),
});

export type Keys = z.infer<typeof Keys>;
