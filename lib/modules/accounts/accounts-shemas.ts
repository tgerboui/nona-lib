import { z } from 'zod';

export const ReceivableValues = z.object({
  blocks: z.record(z.string()).or(z.string()),
});

export type ReceivableValues = z.infer<typeof ReceivableValues>;

export const ReceivableHashes = z.object({
  blocks: z.array(z.string()).or(z.string()),
});

export type ReceivableHashes = z.infer<typeof ReceivableHashes>;
