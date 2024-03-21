import BigNumber from 'bignumber.js';
import { KeyService } from '../../services/hash/key-service';
import { Accounts } from '../accounts/accounts';
import {
  Receivable,
  ReceivableHasheBlocks,
  ReceivableOptions,
  ReceivableOptionsSorted,
  ReceivableOptionsUnsorted,
  ReceivableValueBlocks,
} from '../accounts/accounts-interface';
import { AccountInfo, AccountInfoRepresentative } from '../accounts/accounts-shemas';
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
  public receivable(options: Omit<ReceivableOptions, 'account'>): Promise<Receivable>;
  public receivable(options: Omit<ReceivableOptions, 'account'>): Promise<Receivable> {
    return this.accounts.receivable({ ...options, account: this.account });
  }

  // TODO: Set parameters in interface
  async info(representative: true): Promise<AccountInfoRepresentative>;
  async info(representative: boolean): Promise<AccountInfo>;
  async info(representative = false): Promise<AccountInfo> {
    return this.accounts.info(this.account, representative);
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
    return this.blocks.process(block, 'open');
  }

  public async receive(hash?: string): Promise<string> {
    const info = await this.info(true);
    let receiveHash = hash;

    // If no hash is provided, get a receivable hash
    if (!receiveHash) {
      const receivable = await this.receivable({ count: 1 });
      if (receivable.length === 0) {
        throw new Error('No receivable blocks');
      }
      receiveHash = receivable[0];
    }

    // Get hash info
    const hashInfo = await this.blocks.info(receiveHash);
    const finalBalance = BigNumber(info.balance).plus(hashInfo.amount);

    // Generate work and format block
    const block = await this.blocks.create({
      account: this.account,
      previous: info.frontier,
      representative: info.representative,
      balance: finalBalance.toString(10),
      link: receiveHash,
      key: this.privateKey,
    });

    // Broadcast to network
    return this.blocks.process(block, 'receive');
  }
}
