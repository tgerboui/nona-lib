import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import {
  Receivable,
  ReceivableHasheBlocks,
  ReceivableOptions,
  ReceivableOptionsSorted,
  ReceivableOptionsUnsorted,
  ReceivableValueBlocks,
} from './accounts-interface';
import { ReceivableHashes, ReceivableValues } from './accounts-shemas';

export class Accounts extends RpcConsummer {
  async receivable(options: ReceivableOptionsUnsorted): Promise<ReceivableHasheBlocks>;
  async receivable(options: ReceivableOptionsSorted): Promise<ReceivableValueBlocks>;
  async receivable({ account, count = 100, sort = false }: ReceivableOptions): Promise<Receivable> {
    const receivable = await this.rpc.call('receivable', {
      account,
      count: count?.toString() || undefined,
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
}
