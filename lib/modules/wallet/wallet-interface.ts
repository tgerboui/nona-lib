import { Rpc } from '../../services/rpc/rpc';
import { Account } from '../account/account';
import { Blocks } from '../blocks/blocks';
import { ConfirmationMessage } from '../websocket/confirmation/websocket-confirmation-interface';

export interface WalletOptions {
  rpc: Rpc;
  account: Account;
  privateKey: string;
  blocks: Blocks;
}

export interface WalletListAndReceiveParams {
  next?: (message: ConfirmationMessage) => unknown;
  complete?: () => unknown;
  error?: (error: unknown) => unknown;
}
