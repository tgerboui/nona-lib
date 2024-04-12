// Must change the key names to avoid 'private' and 'public' reserved word error
export interface AccountKeys {
  /** Public key of the account */
  publicKey: string;
  /** Private key of the account */
  privateKey: string;
  /** Address of the account */
  address: string;
}
