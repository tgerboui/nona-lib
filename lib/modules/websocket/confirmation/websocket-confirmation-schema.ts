import { z } from 'zod';

export const WebSocketConfirmationMessage = z.object({
  account: z.string(),
  amount: z.string(),
  hash: z.string(),
  confirmation_type: z.string(),
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
    subtype: z.string(),
  }),
});
export type WebSocketConfirmationMessage = z.infer<typeof WebSocketConfirmationMessage>;
