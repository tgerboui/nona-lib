import { filter, finalize, map, Observable, Subscription } from 'rxjs';

import { WebSocketManager } from '../manager/websocket-manager';
import { WebSocketConfirmationHelper } from './websocket-confirmation-helper';
import {
  ConfirmationBlock,
  ConfirmationFilter,
  WebSocketConfirmationParams,
  WebSocketUpdateConfirmationParams,
} from './websocket-confirmation-interface';

// TODO: Need to refactor this file
export class WebSocketConfirmation {
  private accountListened = new Map<string, number>();
  private observable: Observable<unknown>;
  private subscriptionCount = 0;
  private subscriptionToAll = 0;

  constructor(
    private webSocketManager: WebSocketManager,
    private helper = new WebSocketConfirmationHelper(),
  ) {
    this.observable = this.webSocketManager.subjectTopic('confirmation');
  }

  public subscribe(params: WebSocketConfirmationParams): Subscription {
    const { next, error, complete } = params;

    const accountToListen = this.getAccountsToListen(params.filter);
    this.addSubscription(accountToListen);
    return this.observable
      .pipe(
        map<unknown, ConfirmationBlock>((message) => this.helper.messageMapper(message)),
        filter<ConfirmationBlock>((message) => this.helper.messageFilter(message, params.filter)),
        finalize(() => {
          this.removeSubscription(accountToListen);
        }),
      )
      .subscribe({
        next,
        complete,
        error,
      });
  }

  private getAccountsToListen(confirmationFilter?: ConfirmationFilter): string[] | undefined {
    if (!confirmationFilter) return undefined;
    const { accounts, from, to } = confirmationFilter;
    const accountsToListen = [];
    let filtered = false;
    if (accounts) {
      accountsToListen.push(...accounts);
      filtered = true;
    }
    if (from) {
      accountsToListen.push(...from);
      filtered = true;
    }
    if (to) {
      accountsToListen.push(...to);
      filtered = true;
    }
    if (!filtered) return undefined;

    const uniqueAccounts = Array.from(new Set(accountsToListen));
    return uniqueAccounts;
  }

  private addSubscription(accounts?: string[]): void {
    if (this.subscriptionCount === 0) {
      this.subscribeWebSocket(accounts);
    }

    if (accounts) {
      const addedAccount = this.addAccountsToListened(accounts);
      if (this.subscriptionCount > 0 && this.subscriptionToAll === 0) {
        this.updateWebSocket({
          accountsAdd: addedAccount,
        });
      }
    } else {
      if (this.subscriptionToAll === 0 && this.subscriptionCount > 0) {
        this.subscribeWebSocket();
      }
      this.subscriptionToAll += 1;
    }

    this.subscriptionCount += 1;
  }

  private removeSubscription(accounts?: string[]): void {
    if (accounts) {
      const accountsRemoved = this.removeAccountsFromListened(accounts);
      if (this.subscriptionToAll === 0 && this.subscriptionCount > 1) {
        this.updateWebSocket({ accountsDel: accountsRemoved });
      }
    } else {
      this.subscriptionToAll -= 1;
      if (this.subscriptionToAll === 0 && this.subscriptionCount > 0) {
        this.subscribeWebSocket(Array.from(this.accountListened.keys()));
      }
    }

    this.subscriptionCount -= 1;
    if (this.subscriptionCount === 0) {
      this.unsubscribeWebsocket();
    }
  }

  private addAccountsToListened(accounts: string[]): string[] {
    const addedAccount: string[] = [];

    for (const account of accounts) {
      const accountMap = this.accountListened.get(account);
      if (accountMap) {
        this.accountListened.set(account, accountMap + 1);
      } else {
        addedAccount.push(account);
        this.accountListened.set(account, 1);
      }
    }

    return addedAccount;
  }

  private removeAccountsFromListened(accounts: string[]): string[] {
    const accountRemoved: string[] = [];

    for (const account of accounts) {
      const accountMap = this.accountListened.get(account);
      if (accountMap) {
        if (accountMap === 1) {
          this.accountListened.delete(account);
          accountRemoved.push(account);
        } else {
          this.accountListened.set(account, accountMap - 1);
        }
      }
    }

    return accountRemoved;
  }

  private subscribeWebSocket(accounts?: string[]): void {
    this.webSocketManager.subscribeTopic({
      topic: 'confirmation',
      options: accounts
        ? {
            accounts,
          }
        : undefined,
    });
  }

  private updateWebSocket({ accountsAdd, accountsDel }: WebSocketUpdateConfirmationParams): void {
    this.webSocketManager.updateTopic({
      topic: 'confirmation',
      options: {
        accounts_add: accountsAdd,
        accounts_del: accountsDel,
      },
    });
  }

  private unsubscribeWebsocket(): void {
    this.webSocketManager.unsubscribeTopic('confirmation');
  }
}
