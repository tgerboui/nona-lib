import { Rpc } from '../../services/rpc/rpc';
import { Accounts } from '../accounts/accounts';
import { Blocks } from '../blocks/blocks';
import { ConfirmationMessage } from '../websocket/confirmation/websocket-confirmation-interface';

export interface WalletOptions {
  rpc: Rpc;
  accounts: Accounts;
  privateKey: string;
  blocks: Blocks;
}

export interface WalletListAndReceiveParams {
  next?: (message: ConfirmationMessage) => unknown;
  complete?: () => unknown;
  error?: (error: unknown) => unknown;
}
