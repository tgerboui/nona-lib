import { z } from 'zod';
import { zNanoAddress } from '../../../shared/utils/address';

export const WebSocketConfirmationMessage = z.object({
  account: zNanoAddress(),
  amount: z.string(),
  hash: z.string(),
  confirmation_type: z.string(),
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
    subtype: z.string(),
  }),
});
export type WebSocketConfirmationMessage = z.infer<typeof WebSocketConfirmationMessage>;
