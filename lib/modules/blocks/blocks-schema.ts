import { z } from 'zod';

export const BlockCount = z.object({
  count: z.string(),
  unchecked: z.string(),
  cemented: z.string(),
});

export type BlockCount = z.infer<typeof BlockCount>;

export const Block = z.object({
  hash: z.string(),
  block: z.object({
    type: z.string(),
    account: z.string(),
    previous: z.string(),
    representative: z.string(),
    balance: z.string(),
    link: z.string(),
    link_as_account: z.string(),
    signature: z.string(),
    work: z.string(),
  }),
});

export type Block = z.infer<typeof Block>;

export const BlockProcess = z.object({
  hash: z.string(),
});

export type BlockProcess = z.infer<typeof BlockProcess>;
