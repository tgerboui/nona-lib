import { z } from 'zod';
import { zNanoAddress } from '../../shared/utils/address';

export const BlockCount = z.object({
  /** The total number of blocks in the ledger. This includes all send, receive, open, and change blocks. */
  count: z.string(),
  /** The number of blocks that have been downloaded but not yet confirmed. These blocks are waiting in the processing queue. */
  unchecked: z.string(),
  /** The number of blocks that have been confirmed and cemented in the ledger. Cemented blocks are confirmed irreversible transactions. */
  cemented: z.string(),
});
export type BlockCount = z.infer<typeof BlockCount>;

export const Block = z.object({
  hash: z.string(),
  block: z.object({
    type: z.string(),
    account: zNanoAddress(),
    previous: z.string(),
    representative: zNanoAddress(),
    balance: z.string(),
    link: z.string(),
    link_as_account: zNanoAddress(),
    signature: z.string(),
    work: z.string(),
  }),
});
export type Block = z.infer<typeof Block>;

export const BlockProcess = z.object({
  hash: z.string(),
});
export type BlockProcess = z.infer<typeof BlockProcess>;

// TODO: Comment each fields
export const BlockInfo = z.object({
  block_account: zNanoAddress(),
  amount: z.string(),
  balance: z.string(),
  height: z.string(),
  local_timestamp: z.string(),
  successor: z.string(),
  confirmed: z.string(),
  contents: z.object({
    type: z.string(),
    account: zNanoAddress(),
    previous: z.string(),
    representative: z.string(),
    balance: z.string(),
    link: z.string(),
    link_as_account: zNanoAddress(),
    signature: z.string(),
    work: z.string(),
  }),
  subtype: z.string(),
});
export type BlockInfo = z.infer<typeof BlockInfo>;
