import { Observable, Subscription, filter, finalize, map } from 'rxjs';

import { WebSocketManager } from '../manager/websocket-manager';
import {
  ConfirmationMessage,
  WebSocketConfirmationParams,
  WebSocketUpdateConfirmationParams,
} from './websocket-confirmation-interface';
import { messageFilter, messageMapper } from './websocket-confirmation-helper';

export class WebSocketConfirmation {
  private accountListened = new Map<string, number>();
  private observable: Observable<unknown>;
  private subscriptionCount = 0;

  constructor(private webSocketManager: WebSocketManager) {
    this.observable = this.webSocketManager.subjectTopic('confirmation');
  }

  subscribe(params: WebSocketConfirmationParams): Subscription {
    const {
      filter: { accounts },
      next,
      error,
      complete,
    } = params;

    this.addSubscription(accounts);
    return this.observable
      .pipe(
        map<unknown, ConfirmationMessage>((message) => messageMapper(message)),
        filter<ConfirmationMessage>((message) => messageFilter(message, params.filter)),
        finalize(() => this.removeSubscription(accounts)),
      )
      .subscribe({
        next,
        complete,
        error,
      });
  }

  private addSubscription(accounts: string[]) {
    const addedAccount = this.addAccountsToListened(accounts);
    if (this.subscriptionCount === 0) {
      this.subscribeWebsocket(accounts);
    } else {
      this.updateWebsocket({
        accountsAdd: addedAccount,
      });
    }

    this.subscriptionCount += 1;
  }

  private removeSubscription(accounts: string[]) {
    const accountsRemoved = this.removeAccountsFromListened(accounts);
    this.updateWebsocket({ accountsDel: accountsRemoved });
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

  private subscribeWebsocket(accounts: string[]) {
    this.webSocketManager.subscribeTopic({
      topic: 'confirmation',
      options: {
        accounts,
      },
    });
  }

  private updateWebsocket({ accountsAdd, accountsDel }: WebSocketUpdateConfirmationParams) {
    this.webSocketManager.updateTopic({
      topic: 'confirmation',
      options: {
        accounts_add: accountsAdd,
        accounts_del: accountsDel,
      },
    });
  }

  private unsubscribeWebsocket() {
    this.webSocketManager.unsubscribeTopic('confirmation');
  }
}
