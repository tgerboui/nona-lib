import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import {
  AccountHistoryParams,
  InfoParams,
  InfoParamsWithRepresentative,
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
  AccountBalance,
  ReceivableHashes,
  ReceivableValues,
  accountBlockCountSchema,
  accountWeightSchema,
} from './account-shemas';
import { UnitService } from '../../services/unit/unit-service';
import { Rpc } from '../../services/rpc/rpc';
import { Subscription } from 'rxjs';
import { NonaWebSocket } from '../websocket/websocket';

export class Account extends RpcConsummer {
  constructor(private account: string, private websocket: NonaWebSocket, rpc: Rpc) {
    super(rpc);
  }

  /**
   * Returns a list of block hashes which have not yet been received by this account.
   */
  public async receivable(options?: ReceivableOptionsUnsorted): Promise<ReceivableHasheBlocks>;
  public async receivable(options?: ReceivableOptionsSorted): Promise<ReceivableValueBlocks>;
  public async receivable(options?: ReceivableOptions): Promise<Receivable>;
  public async receivable({
    count = 100,
    sort = false,
  }: ReceivableOptions = {}): Promise<Receivable> {
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

  /**
   * Returns general information for account. Only works for accounts that have received their first transaction and have an entry on the ledger, will return "Account not found" otherwise. To open an account, use open.
   *
   * @param representative - If true, the representative field will be included in the response. Default to false.
   * @param raw - Specifies whether to return the raw balance. Default to false.
   * @returns Frontier, open block, change representative block, balance, last modified timestamp from local database & block count
   */
  public async info(params: InfoParamsWithRepresentative): Promise<AccountInfoRepresentative>;
  public async info(params?: InfoParams): Promise<AccountInfo>;
  public async info({
    representative = false,
    raw = false,
  }: InfoParams = {}): Promise<AccountInfo> {
    const res = await this.rpc.call('account_info', { account: this.account, representative });
    const schema = representative ? AccountInfoRepresentative : AccountInfo;
    const info = this.parseHandler(res, schema);

    if (raw) return info;

    return {
      ...info,
      balance: UnitService.rawToNanoString(info.balance),
    };
  }

  /**
   * Returns how many nano is owned and how many have not yet been received by account.
   *
   * @param raw - Specifies whether to return the raw balance. Default to false.
   * @returns Balance, pending and receivable as string to avoid precision loss.
   */
  public async balance({ raw = false }: { raw?: boolean } = {}): Promise<AccountBalance> {
    const res = await this.rpc.call('account_balance', { account: this.account });
    const balance = this.parseHandler(res, AccountBalance);

    // Directly return the raw balance if raw is set to true because the balance is already in raw unit.
    if (raw) return balance;

    // Otherwise, convert the balance to nano unit.
    return {
      balance: UnitService.rawToNanoString(balance.balance),
      pending: UnitService.rawToNanoString(balance.pending),
      receivable: UnitService.rawToNanoString(balance.receivable),
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

  public async blockCount(): Promise<number> {
    const res = await this.rpc.call('account_block_count', { account: this.account });
    const count = this.parseHandler(res, accountBlockCountSchema).block_count;

    return parseInt(count, 10);
  }

  public async representative(): Promise<string> {
    const { representative } = await this.info({
      representative: true,
    });

    return representative;
  }

  public async weight(): Promise<string> {
    const res = await this.rpc.call('account_weight', { account: this.account });
    return this.parseHandler(res, accountWeightSchema).weight;
  }
}
