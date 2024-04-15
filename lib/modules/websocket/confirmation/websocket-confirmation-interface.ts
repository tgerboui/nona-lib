// TODO: Document each field
export interface WebSocketConfirmationParams {
  /**
   * A function that will be called each time a transaction is received.
   * @param block The block that was received.
   */
  next: (block: ConfirmationBlock) => unknown;
  /**
   * A function that will be called when an error occurs.
   * @param error The error that occurred.
   */
  error?: (error: unknown) => unknown;
  /**
   * A function that will be called when the listener completes.
   */
  complete?: () => unknown;
  /**
   * A filter that will be used to filter the confirmation blocks.
   */
  filter?: ConfirmationFilter;
}

export interface WebSocketUpdateConfirmationParams {
  accountsAdd?: string[];
  accountsDel?: string[];
}

/**
 * Represents a confirmation block in a WebSocket communication.
 */
export interface ConfirmationBlock {
  /** Account address that sent the transaction. */
  from: string;
  /** Account address receiving the transaction.  */
  to: string;
  /** Amount transferred in the transaction, represented as a raw string. */
  amount: string;
  /** Subtype of the block, which indicates the kind of transaction (e.g., send, receive). */
  subtype: string;
  /** Unique hash of the block. This serves as an identifier for the block on the network. */
  hash: string;
  /** Hash of the previous block in the account's chain, linking this block to its predecessor. */
  previous: string;
  /** Work field represents the Proof of Work for the block. */
  work: string;
  /** In a send block, represents the destination account or pending block being received. In a receive block, it represents the source block. */
  link: string;
  confirmationType: string;
}

export interface ConfirmationFilter {
  /** List of account addresses to filter the confirmation blocks. */
  accounts?: string[];
  /** List of block subtypes to filter the confirmation blocks. */
  subtype?: string[];
  /** Account addresses that sent the transaction. */
  from?: string[];
  /** Account addresses that received the transaction. */
  to?: string[];
}
