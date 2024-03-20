import { KeyService } from '../../services/hash/key-service';
import { Accounts } from '../accounts/accounts';
import {
  ReceivableHasheBlocks,
  ReceivableOptionsSorted,
  ReceivableOptionsUnsorted,
  ReceivableValueBlocks,
} from '../accounts/accounts-interface';
import { Blocks } from '../blocks/blocks';
import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { AccountOptions } from './account-interface';

export class Account extends RpcConsummer {
  private accounts: Accounts;
  private blocks: Blocks;

  privateKey: string;
  publicKey: string;
  account: string;

  constructor({ rpc, accounts, privateKey, blocks }: AccountOptions) {
    super(rpc);
    this.accounts = accounts;
    this.privateKey = privateKey;
    this.blocks = blocks;
    this.publicKey = KeyService.getPublicKey(privateKey);
    this.account = KeyService.getAccount(this.publicKey);
  }

  public receivable(
    options: Omit<ReceivableOptionsUnsorted, 'account'>,
  ): Promise<ReceivableHasheBlocks>;
  public receivable(
    options: Omit<ReceivableOptionsSorted, 'account'>,
  ): Promise<ReceivableValueBlocks>;
  public receivable(options: Omit<ReceivableOptionsUnsorted | ReceivableOptionsSorted, 'account'>) {
    const { sort } = options;

    // TODO: Clean this horror show
    // It is a probleme with fucntion overloading
    if (sort == undefined) {
      return this.accounts.receivable({ ...options, account: this.account, sort: undefined });
    }
    if (sort === true) {
      return this.accounts.receivable({ ...options, account: this.account, sort: true });
    }
    return this.accounts.receivable({ ...options, account: this.account, sort: false });
  }

  // TODO: Implement optional hash
  // TODO: Set options in interface
  public async open(representative: string): Promise<string> {
    // Highest hash
    const lastHashes = await this.receivable({ count: 1, sort: true });
    if (Object.keys(lastHashes).length === 0) {
      throw new Error('No receivable blocks');
    }
    const hash = Object.keys(lastHashes)[0];
    const hashValue = lastHashes[hash];

    // Generate work
    const block = await this.blocks.create({
      previous: '0',
      representative,
      account: this.account,
      link: hash,
      balance: hashValue,
      key: this.privateKey,
    });
    // Broadcast to network
    const hashTr = await this.blocks.process(block);

    return hashTr;
  }
}
