interface BaseReceivableOptions {
  account: string;
  count?: number;
}

export interface ReceivableOptionsSorted extends BaseReceivableOptions {
  sort?: true;
}

export interface ReceivableOptionsUnsorted extends BaseReceivableOptions {
  sort?: false;
}

export type ReceivableOptions = ReceivableOptionsSorted | ReceivableOptionsUnsorted;

export type ReceivableHasheBlocks = string[];
export type ReceivableValueBlocks = {
  [key: string]: string;
};
export type Receivable = ReceivableHasheBlocks | ReceivableValueBlocks;
