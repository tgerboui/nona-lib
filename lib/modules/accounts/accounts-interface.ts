export interface ReceivableOptions {
  account: string;
  count?: number;
  sort?: boolean;
}

export interface ReceivableOptionsSorted extends ReceivableOptions {
  sort: true;
}

export interface ReceivableOptionsUnsorted extends ReceivableOptions {
  sort?: false;
}

export type ReceivableHasheBlocks = string[];
export type ReceivableValueBlocks = {
  [key: string]: string;
};
export type Receivable = ReceivableHasheBlocks | ReceivableValueBlocks;
