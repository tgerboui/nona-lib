import { z } from 'zod';

import { UnitService } from '../../services/unit/unit-service';
import { zNanoAddress } from '../../shared/utils/address';

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

export const AccountInfoRepresentative = AccountInfo.extend({
  /** Account address of the currently set representative for this account. */
  representative: zNanoAddress(),
});
export type AccountInfoRepresentative = z.infer<typeof AccountInfoRepresentative>;

export const AccountBalance = z.object({
  /**
   * Total balance of the account.
   * This is the balance that is currently settled in the account.
   */
  balance: z.string(),
  /**
   * Total balance that is pending receipt.
   * pending was deprecated in favor of receivable. For compatibility reasons both terms are still available for many calls and in responses.
   * For more details see: https://docs.nano.org/releases/release-v24-0/#pendingreceivable-term-rpc-updates.
   */
  pending: z.string(),
  /**
   * Total balance that is available to be received.
   */
  receivable: z.string(),
});
export type AccountBalance = z.infer<typeof AccountBalance>;

export const AccountHistoryPagination = z.object({
  /** Hash of the previous block in the account's blockchain. */
  previous: z.string().optional(),
  /** Hash of the next block in the account's blockchain. */
  next: z.string().optional(),
});
export type AccountHistoryPagination = z.infer<typeof AccountHistoryPagination>;

export const AccountHistoryBlock = z.object({
  /** Account address of the block. */
  account: zNanoAddress(),
  /** Amount of the block in nano unit */
  amount: z.string().transform((amount) => UnitService.rawToNanoString(amount)),
  /** Type of block. */
  type: z.string(),
  /** Hash of the block. */
  hash: z.string(),
  /** UNIX timestamp indicating the time the block was added to the ledger. */
  local_timestamp: z.string().transform(Number),
  /** Height of the block in the account's blockchain. */
  height: z.string().transform(Number),
});
export type AccountHistoryBlock = z.infer<typeof AccountHistoryBlock>;

export const AccountHistoryRawBlock = AccountHistoryBlock.extend({
  /** Account address of the block. Not present if it's a 'receive' or 'send' block. */
  account: zNanoAddress().optional(),
  /** Amount of the block in raw unit. Not present if it's a 'receive' or 'send' block. */
  amount: z.string().optional(),
  /** Account address of the representative for this account. */
  representative: z.string().optional(),
  /** Link block hash. */
  link: z.string().optional(),
  /** Hash of the previous block in the account's blockchain. Not present if it's a 'open' block. */
  previous: z.string().optional(),
  /** Balance of the account after this block in raw unit. Not present if it's a 'change' block */
  balance: z.string().optional(),
  /** Type of the block */
  subtype: z.string().optional(),
  /** Whether the block has been confirmed by the network. */
  confirmed: z.string().transform(Boolean),
  /** Work value of the block. */
  work: z.string(),
  /** Signature of the block. */
  signature: z.string(),
});

export const AccountHistory = AccountHistoryPagination.extend({
  history: z.array(AccountHistoryBlock),
});
export type AccountHistory = z.infer<typeof AccountHistory>;

export const AccountRawHistory = AccountHistoryPagination.extend({
  history: z.array(AccountHistoryRawBlock),
});
export type AccountRawHistory = z.infer<typeof AccountRawHistory>;

export const accountBlockCountSchema = z.object({
  block_count: z.string(),
});

export const accountWeightSchema = z.object({
  weight: z.string(),
});
