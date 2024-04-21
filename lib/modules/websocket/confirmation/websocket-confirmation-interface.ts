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
  /** Account address involved in the transaction. */
  account: string;
  /** Amount transferred in the transaction, in nano unit. */
  amount: string;
  /** Unique hash of the block. This serves as an identifier for the block on the network. */
  hash: string;
  /** Method or type of confirmation for the transaction */
  confirmationType: string;
  block: {
    /** The account address that owns this block. */
    account: string;
    /** Hash of the previous block in the account's chain, linking this block to its predecessor. 0 if open block. */
    previous: string;
    /** Representative of the account. */
    representative: string;
    /** Resulting balance of the account in nano unit. */
    balance: string;
    /** In a send block, public key of the destination account; in a receive block, the hash of the send block being received; in a change block, 0. */
    link: string;
    /** In a send block, account address of the link field. */
    linkAsAccount: string;
    /** Digital signature of the block. */
    signature: string;
    /** Work field represents the Proof of Work for the block. */
    work: string;
    /** Subtype of the block, which indicates the kind of transaction (e.g., send, receive). */
    subtype: string;
  };
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
