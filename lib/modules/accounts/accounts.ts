import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import {
  Receivable,
  ReceivableHasheBlocks,
  ReceivableOptions,
  ReceivableOptionsSorted,
  ReceivableOptionsUnsorted,
  ReceivableValueBlocks,
} from './accounts-interface';
import {
  AccountInfo,
  AccountInfoRepresentative,
  ReceivableHashes,
  ReceivableValues,
} from './accounts-shemas';

export class Accounts extends RpcConsummer {
  public async receivable(options: ReceivableOptionsUnsorted): Promise<ReceivableHasheBlocks>;
  public async receivable(options: ReceivableOptionsSorted): Promise<ReceivableValueBlocks>;
  public async receivable(optiosn: ReceivableOptions): Promise<Receivable>;
  public async receivable({
    account,
    count = 100,
    sort = false,
  }: ReceivableOptions): Promise<Receivable> {
    const receivable = await this.rpc.call('receivable', {
      account,
      count: count?.toString() ?? undefined,
      sorting: sort,
    });

    if (sort) {
      const blocksObject = this.parseHandler(receivable, ReceivableValues).blocks;
      if (typeof blocksObject === 'string') return {};
      return blocksObject;
    }

    const blocksArray = this.parseHandler(receivable, ReceivableHashes).blocks;
    if (typeof blocksArray === 'string') return [];
    return blocksArray;
  }

  public async info(account: string, representative: true): Promise<AccountInfoRepresentative>;
  public async info(account: string, representative: true): Promise<AccountInfoRepresentative>;
  public async info(account: string, representative: boolean): Promise<AccountInfo>;
  public async info(account: string, representative = false): Promise<AccountInfo> {
    const res = await this.rpc.call('account_info', { account, representative });

    return this.parseHandler(res, AccountInfo);
  }
}
