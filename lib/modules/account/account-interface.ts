import { NanoAddress } from '../../shared/utils/address';
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
/** Key: hash of the block, value: amount */
export type ReceivableValueBlocks = Record<string, string>;
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

export interface AccountHistoryParams {
  /** Number of blocks to return. Default to 100. */
  count?: number;
  /** Hash of the block to start from. */
  head?: string;
  /** Number of blocks to skip. */
  offset?: number;
  /** Reverse order */
  reverse?: boolean;
  /** Results will be filtered to only show sends/receives connected to the provided account(s). */
  accounts?: NanoAddress[];
  /**
   * if set to true instead of the default false, returns all blocks history and output all parameters of the block itself.
   */
  raw?: boolean;
}

export type AccountHistoryParamsRaw = AccountHistoryParams & {
  raw: true;
};
