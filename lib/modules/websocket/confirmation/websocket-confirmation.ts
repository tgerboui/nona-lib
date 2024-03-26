import { Observable, Subscription, filter, finalize, map } from 'rxjs';

import { WebSocketManager } from '../manager/websocket-manager';
import {
  ConfirmationMessage,
  WebSocketConfirmationParams,
  WebSocketUpdateConfirmationParams,
} from './websocket-confirmation-interface';
import { messageFilter, messageMapper } from './websocket-confirmation-helper';

// TODO: Really need tests here
export class WebSocketConfirmation {
  private accountListened = new Map<string, number>();
  private observable: Observable<unknown>;
  private subscriptionCount = 0;
  private subscriptionToAll = 0;

  constructor(private webSocketManager: WebSocketManager) {
    this.observable = this.webSocketManager.subjectTopic('confirmation');
  }

  subscribe(params: WebSocketConfirmationParams): Subscription {
    const { next, error, complete } = params;

    this.addSubscription(params.filter?.accounts);
    return this.observable
      .pipe(
        map<unknown, ConfirmationMessage>((message) => messageMapper(message)),
        filter<ConfirmationMessage>((message) => messageFilter(message, params.filter)),
        finalize(() => this.removeSubscription(params.filter?.accounts)),
      )
      .subscribe({
        next,
        complete,
        error,
      });
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
      if (this.subscriptionToAll === 0) {
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

  private updateWebSocket({ accountsAdd, accountsDel }: WebSocketUpdateConfirmationParams) {
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
