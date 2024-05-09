import { NanoAddress } from '../../shared/utils/address';

export interface CreateBlockParams {
  /** The account the block is being created for. */
  account: NanoAddress;
  /** Final balance for account after block creation. In raw unit */
  balance: string;
  /** Private key of the account */
  key: string;
  /** The block hash of the previous block on this account's block chain ("0" for first block). */
  previous: string;
  /** The representative account for the account. */
  representative: NanoAddress;
  /** If the block is sending funds, set link to the public key of the destination account. If it is receiving funds, set link to the hash of the block to receive. If the block has no balance change but is updating representative only, set link to 0. */
  link: string;
}

export type BlockProcessSubtype = 'open' | 'receive' | 'change' | 'send' | 'state';
