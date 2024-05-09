import { NanoAddress } from '../../shared/utils/address';

// Must change the key names to avoid 'private' and 'public' reserved word error
export interface AccountKeys {
  /** Private key of the account */
  privateKey: string;
  /** Public key of the account */
  publicKey: string;
  /** Address of the account */
  address: NanoAddress;
}

export interface ExpandedKeys {
  /** Public key of the account */
  publicKey: string;
  /** Address of the account */
  address: NanoAddress;
}
