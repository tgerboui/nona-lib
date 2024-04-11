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
  /** Hash of the latest block in the account's blockchain. */
  frontier: z.string(),
  /** Hash of the first block in the account's blockchain. */
  open_block: z.string(),
  /** Hash of the block where the account's representative was last set or changed. Representatives vote on behalf of accounts for network consensus. */
  representative_block: z.string(),
  /** Current balance of the account. In nano if raw param is set to false (default) otherwise in raw unit. */
  balance: z.string(),
  /** UNIX timestamp indicating the last time the account's blockchain was modified. */
  modified_timestamp: z.string(),
  /** Total number of blocks in the account's blockchain, including send, receive, change, and epoch blocks. */
  block_count: z.string(),
  /** Version of the account, reflecting certain features or capabilities of the account on the network. */
  account_version: z.string(),
  /** Height of the highest block in the account's blockchain that has been confirmed by the network. */
  confirmation_height: z.string(),
  /** Block hash at the confirmation height, pointing to the last confirmed block in the account's chain. */
  confirmation_height_frontier: z.string(),
});
export type AccountInfo = z.infer<typeof AccountInfo>;

export const AccountInfoRepresentative = AccountInfo.and(
  z.object({
    /** Account address of the currently set representative for this account. */
    representative: z.string(),
  }),
);
export type AccountInfoRepresentative = z.infer<typeof AccountInfoRepresentative>;

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

export const accountBlockCountSchema = z.object({
  block_count: z.string(),
});

export const accountWeightSchema = z.object({
  weight: z.string().transform(UnitService.rawToNanoString),
});
