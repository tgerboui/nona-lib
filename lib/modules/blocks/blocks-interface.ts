import { NanoAddress } from '../../shared/utils/address';

export interface CreateBlockParams {
  /** The account the block is being created for. */
  account: NanoAddress;
  /** Final balance for account after block creation. In raw unit */
  balance: string;
  /** Private key of the account */
  privateKey: string;
  /** The block hash of the previous block on this account's block chain ("0" for first block). */
  previous: string;
  /** The representative account for the account. */
  representative: NanoAddress;
  /** If the block is sending funds, set link to the public key of the destination account. If it is receiving funds, set link to the hash of the block to receive. If the block has no balance change but is updating representative only, set link to 0. */
  link: string;
  /** Proof of work for the block */
  work: string;
}

export interface SignedBlock {
  type: string;
  account: string;
  previous: string;
  representative: string;
  balance: string;
  link: string;
  signature: string;
  work: string;
}

export type BlockProcessSubtype = 'open' | 'receive' | 'change' | 'send' | 'state';

export type HashBlockParams = Omit<CreateBlockParams, 'privateKey'>;

export interface BlockSignParams {
  hash: string;
  privateKey: string;
}
