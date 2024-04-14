import { ConfirmationBlock } from '../websocket/confirmation/websocket-confirmation-interface';

export interface WalletListAndReceiveParams {
  /**
   * A function that will be called each time a transaction is received.
   * @param block The block that was received.
   */
  next?: (block: ConfirmationBlock) => unknown;
  /**
   * A function that will be called when an error occurs.
   * @param error The error that occurred.
   */
  error?: (error: unknown) => unknown;
  /**
   * A function that will be called when the listener completes.
   */
  complete?: () => unknown;
}
