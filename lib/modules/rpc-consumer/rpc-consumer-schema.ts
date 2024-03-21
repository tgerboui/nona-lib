import { z } from 'zod';

export const rpcError = z.object({
  error: z.string(),
});
