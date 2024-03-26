import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import {
  AccountBalance,
  ListenConfirmationParams,
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
  AccountRawBalance,
  ReceivableHashes,
  ReceivableValues,
} from './accounts-shemas';
import { UnitService } from '../../services/unit/unit-service';
import { Rpc } from '../../services/rpc/rpc';
import { Subscription } from 'rxjs';
import { NonaWebSocket } from '../websocket/websocket';

export class Accounts extends RpcConsummer {
  constructor(rpc: Rpc, private websocket: NonaWebSocket) {
    super(rpc);
  }

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

  public async rawBalance(account: string): Promise<AccountRawBalance> {
    const res = await this.rpc.call('account_balance', { account });

    return this.parseHandler(res, AccountRawBalance);
  }

  // TODO: Explain why string and warn about converting to number
  public async balance(account: string): Promise<AccountBalance> {
    const { balance, pending, receivable } = await this.rawBalance(account);

    return {
      balance: UnitService.rawToNano(balance).toString(10),
      pending: UnitService.rawToNano(pending).toString(10),
      receivable: UnitService.rawToNano(receivable).toString(10),
    };
  }

  public listenConfirmation(accounts: string[], params: ListenConfirmationParams): Subscription {
    return this.websocket.confirmation.subscribe({
      ...params,
      filter: { ...params.filter, accounts },
    });
  }
}
