import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import {
  AccountBalance,
  AccountHistoryParams,
  ListenConfirmationParams,
  Receivable,
  ReceivableHasheBlocks,
  ReceivableOptions,
  ReceivableOptionsSorted,
  ReceivableOptionsUnsorted,
  ReceivableValueBlocks,
} from './account-interface';
import {
  AccountHistory,
  AccountInfo,
  AccountInfoRepresentative,
  AccountRawBalance,
  ReceivableHashes,
  ReceivableValues,
} from './account-shemas';
import { UnitService } from '../../services/unit/unit-service';
import { Rpc } from '../../services/rpc/rpc';
import { Subscription } from 'rxjs';
import { NonaWebSocket } from '../websocket/websocket';

export class Account extends RpcConsummer {
  constructor(private account: string, private websocket: NonaWebSocket, rpc: Rpc) {
    super(rpc);
  }

  public async receivable(options: ReceivableOptionsUnsorted): Promise<ReceivableHasheBlocks>;
  public async receivable(options: ReceivableOptionsSorted): Promise<ReceivableValueBlocks>;
  public async receivable(options: ReceivableOptions): Promise<Receivable>;
  public async receivable({ count = 100, sort = false }: ReceivableOptions): Promise<Receivable> {
    const receivable = await this.rpc.call('receivable', {
      account: this.account,
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

  public async info(representative: true): Promise<AccountInfoRepresentative>;
  public async info(representative: true): Promise<AccountInfoRepresentative>;
  public async info(representative: boolean): Promise<AccountInfo>;
  public async info(representative = false): Promise<AccountInfo> {
    const res = await this.rpc.call('account_info', { account: this.account, representative });

    return this.parseHandler(res, AccountInfo);
  }

  public async rawBalance(): Promise<AccountRawBalance> {
    const res = await this.rpc.call('account_balance', { account: this.account });

    return this.parseHandler(res, AccountRawBalance);
  }

  // TODO: Explain why string and warn about converting to number
  public async balance(): Promise<AccountBalance> {
    const { balance, pending, receivable } = await this.rawBalance();

    // TODO: Set this in the schema
    return {
      balance: UnitService.rawToNano(balance).toString(10),
      pending: UnitService.rawToNano(pending).toString(10),
      receivable: UnitService.rawToNano(receivable).toString(10),
    };
  }

  public listenConfirmation(params: ListenConfirmationParams): Subscription {
    return this.websocket.confirmation.subscribe({
      ...params,
      filter: { ...params.filter, accounts: [this.account] },
    });
  }

  public async history({
    count = 100,
    ...params
  }: AccountHistoryParams = {}): Promise<AccountHistory> {
    const res = await this.rpc.call('account_history', { account: this.account, ...params, count });

    return this.parseHandler(res, AccountHistory);
  }
}
