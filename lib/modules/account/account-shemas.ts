import { z } from 'zod';

import { UnitService } from '../../services/unit/unit-service';

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

export const AccountRawBalance = z.object({
  balance: z.string(),
  pending: z.string(),
  receivable: z.string(),
});
export type AccountRawBalance = z.infer<typeof AccountRawBalance>;

export const AccountHistory = z.object({
  history: z.array(
    z.object({
      type: z.string(),
      account: z.string(),
      amount: z.string().transform(UnitService.rawToNanoString),
      hash: z.string(),
      local_timestamp: z.string(),
      height: z.string(),
    }),
  ),
  previous: z.string().optional(),
  next: z.string().optional(),
});
export type AccountHistory = z.infer<typeof AccountHistory>;
