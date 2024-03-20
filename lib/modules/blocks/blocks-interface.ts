export interface BlockCreateOptions {
  /// Final balance for account after block creation
  balance: string;

  /// Private key of account
  key: string;

  /// The block hash of the previous block on this account's block chain ("0" for first block).
  previous: string;

  /// The account that block account will use as its representative.
  representative: string;

  /// The account the block is being created for.
  account: string;

  /// If the block is sending funds, set link to the public key of the destination account. If it is receiving funds, set link to the hash of the block to receive. If the block has no balance change but is updating representative only, set link to 0.
  link: string;
}
