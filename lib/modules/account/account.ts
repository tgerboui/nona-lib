import { Subscription } from 'rxjs';

import { Rpc } from '../../services/rpc/rpc';
import { UnitService } from '../../services/unit/unit-service';
import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { NonaWebSocket } from '../websocket/websocket';
import {
  AccountHistoryParams,
  AccountHistoryParamsRaw,
  InfoParams,
  InfoParamsWithRepresentative,
  ListenConfirmationParams,
  Receivable,
  ReceivableHasheBlocks,
  ReceivableParams,
  ReceivableParamsSorted,
  ReceivableParamsUnsorted,
  ReceivableValueBlocks,
} from './account-interface';
import {
  AccountBalance,
  accountBlockCountSchema,
  AccountHistory,
  AccountInfo,
  AccountInfoRepresentative,
  AccountRawHistory,
  accountWeightSchema,
  ReceivableHashes,
  ReceivableValues,
} from './account-shemas';

export class Account extends RpcConsummer {
  constructor(public address: string, private websocket: NonaWebSocket, rpc: Rpc) {
    super(rpc);
  }

  /**
   * Returns a list of block hashes which have not yet been received by this account.
   * @param {{ count, sort }} params - Receivable parameters
   * @returns An array of block hashes is not sorted or an object with block hashes as keys and amounts as values.
   */
  public async receivable(params?: ReceivableParamsUnsorted): Promise<ReceivableHasheBlocks>;
  public async receivable(params?: ReceivableParamsSorted): Promise<ReceivableValueBlocks>;
  public async receivable(params?: ReceivableParams): Promise<Receivable>;
  public async receivable({
    count = 100,
    sort = false,
  }: ReceivableParams = {}): Promise<Receivable> {
    const receivable = await this.rpc.call('receivable', {
      count,
      account: this.address,
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
    const res = await this.rpc.call('account_info', { account: this.address, representative });
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
    const res = await this.rpc.call('account_balance', { account: this.address });
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

  /**
   * Listen for confirmation of a transaction.
   * @param {{ next, error, complete, filter }} params Callback for the listener and filter for the confirmation.
   * @returns Subscription object that can be used to unsubscribe from the listener.
   */
  public listenConfirmation(params: ListenConfirmationParams): Subscription {
    return this.websocket.confirmation({
      ...params,
      filter: { ...params.filter, accounts: [this.address] },
    });
  }

  /**
   * Retrieves the account history.
   * Returns only send & receive blocks by default (unless raw is set to true - see optional parameters below): change, state change & state epoch blocks are skipped, open & state open blocks will appear as receive, state receive/send blocks will appear as receive/send entries.
   * Response will start with the latest block for the account (the frontier), and will list all blocks back to the open block of this account when "count" is set to "-1".
   *
   * @param {{ count, head, offset, reverse, accounts }} params - Optional parameters for the account history request.
   * @param {{ raw }} raw - If set to true instead of the default false, output all parameters of the block itself and include change, state change & state epoch blocks.
   * @returns {Promise<AccountHistory>} - A promise that resolves to the account history.
   */
  public async history(params: AccountHistoryParamsRaw): Promise<AccountRawHistory>;
  public async history(params?: AccountHistoryParams): Promise<AccountHistory>;
  public async history({ count = 100, raw = false, ...params }: AccountHistoryParams = {}): Promise<
    AccountHistory | AccountRawHistory
  > {
    const { accounts, head, offset, reverse } = params;
    const res = await this.rpc.call('account_history', {
      account: this.address,
      head,
      offset,
      reverse,
      count,
      raw,
      account_filter: accounts,
    });

    if (raw) {
      return this.parseHandler(res, AccountRawHistory);
    }
    return this.parseHandler(res, AccountHistory);
  }

  /**
   * Returns the number of blocks for this account.
   * @returns A Promise that resolves to the number of blocks.
   */
  public async blockCount(): Promise<number> {
    const res = await this.rpc.call('account_block_count', { account: this.address });
    const count = this.parseHandler(res, accountBlockCountSchema).block_count;

    return parseInt(count, 10);
  }

  /**
   * Returns the representative of the account.
   * @returns A Promise that resolves to a string representing the account's representative.
   */
  public async representative(): Promise<string> {
    const { representative } = await this.info({
      representative: true,
    });

    return representative;
  }

  /**
   * Returns the voting weight of the account in nano unit (default).
   * @param {{ raw }} raw - If set to true instead of the default false, output in raw unit.
   * @returns A Promise that resolves to a string representing the voting weight of the account.
   */
  public async weight({ raw = false }: { raw?: boolean } = {}): Promise<string> {
    const res = await this.rpc.call('account_weight', { account: this.address });
    const weight = this.parseHandler(res, accountWeightSchema).weight;

    if (raw) {
      return weight;
    }
    return UnitService.rawToNanoString(weight);
  }
}
