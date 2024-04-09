import { ConfirmationMessage } from '../websocket/confirmation/websocket-confirmation-interface';

export interface WalletListAndReceiveParams {
  next?: (message: ConfirmationMessage) => unknown;
  complete?: () => unknown;
  error?: (error: unknown) => unknown;
}
