import {
  ConfirmationFilter,
  WebSocketConfirmationParams,
} from '../websocket/confirmation/websocket-confirmation-interface';

export interface ReceivableParams {
  /**
   * Specifies the number of blocks to return.
   * Default to 100.
   */
  count?: number;
  /**
   * Specifies whether to sort the response by block amount.
   * Default to false.
   */
  sort?: boolean;
}

export interface ReceivableParamsSorted extends ReceivableParams {
  sort: true;
}

export interface ReceivableParamsUnsorted extends ReceivableParams {
  sort?: false;
}

/**
 * Represents a list of receivable block identifiers as strings.
 * These can be used to fetch more detailed information about each block.
 */
export type ReceivableHasheBlocks = string[];
export type ReceivableValueBlocks = {
  /** Key: hash of the block, value: amount */
  [key: string]: string;
};
/**
 * Represents a list of receivable block identifiers as strings.
 * These can be used to fetch more detailed information about each block.
 */
export type Receivable = ReceivableHasheBlocks | ReceivableValueBlocks;

export interface InfoParams {
  /**
   * Specifies whether to include the representative in the response.
   * Default to false.
   */
  representative?: boolean;
  /**
   * Specifies whether to return the raw balance.
   * Default to false.
   */
  raw?: boolean;
}

export type InfoParamsWithRepresentative = InfoParams & {
  representative: true;
};

export type ListenConfirmationParams = Omit<WebSocketConfirmationParams, 'filter'> & {
  filter?: Omit<ConfirmationFilter, 'accounts'>;
};

// TODO: Docs
export interface AccountHistoryParams {
  /** Number of blocks to return. Default to 100. */
  count?: number; /// Default 100
  /** Hash of the block to start from. */
  head?: string;
  /** Number of blocks to skip. */
  offset?: number;
  /** Reverse order */
  reverse?: boolean;
  /** Filter the blocks */
  account_filter?: string[];
  // TODO: Handle raw format
  // raw?: string;
}
