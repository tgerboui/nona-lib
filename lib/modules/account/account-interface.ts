import {
  ConfirmationFilter,
  WebSocketConfirmationParams,
} from '../websocket/confirmation/websocket-confirmation-interface';

export interface ReceivableOptions {
  count?: number;
  sort?: boolean;
}

export interface ReceivableOptionsSorted extends ReceivableOptions {
  sort: true;
}

export interface ReceivableOptionsUnsorted extends ReceivableOptions {
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

export interface AccountBalance {
  balance: string;
  pending: string;
  receivable: string;
}

export type ListenConfirmationParams = Omit<WebSocketConfirmationParams, 'filter'> & {
  filter?: Omit<ConfirmationFilter, 'accounts'>;
};

// TODO: Docs
export interface AccountHistoryParams {
  count?: number; /// Default 100
  head?: string;
  offset?: number;
  reverse?: boolean;
  account_filter?: string[];
  // TODO: Handle raw format
  // raw?: string;
}
