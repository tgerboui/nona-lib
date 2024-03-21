import { z } from 'zod';

export const ReceivableValues = z.object({
  blocks: z.record(z.string()).or(z.string()),
});
export type ReceivableValues = z.infer<typeof ReceivableValues>;

export const ReceivableHashes = z.object({
  blocks: z.array(z.string()).or(z.string()),
});
export type ReceivableHashes = z.infer<typeof ReceivableHashes>;

export const AccountInfo = z.object({
  frontier: z.string(),
  open_block: z.string(),
  representative_block: z.string(),
  balance: z.string(),
  modified_timestamp: z.string(),
  block_count: z.string(),
  account_version: z.string(),
  confirmation_height: z.string(),
  confirmation_height_frontier: z.string(),
  representative: z.string().optional(),
});
export type AccountInfo = z.infer<typeof AccountInfo>;
export type AccountInfoRepresentative = AccountInfo & {
  representative: string;
};
