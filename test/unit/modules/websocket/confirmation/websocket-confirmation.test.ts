/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';

import { WebSocketConfirmation } from '../../../../../lib/modules/websocket/confirmation/websocket-confirmation';
import { WebSocketConfirmationHelper } from '../../../../../lib/modules/websocket/confirmation/websocket-confirmation-helper';
import { WebSocketManager } from '../../../../../lib/modules/websocket/manager/websocket-manager';

jest.mock('../../../../../lib/modules/websocket/manager/websocket-manager');
jest.mock('../../../../../lib/modules/websocket/confirmation/websocket-confirmation-helper');

const confirmationMessage = {
  account: 'account1',
  amount: '1000000000000000000000000000000',
  hash: 'hash',
  confirmation_type: 'confirmation_type',
  block: {
    type: 'type',
    account: 'account2',
    previous: 'previous',
    representative: 'representative',
    balance: 'balance',
    link: 'link',
    link_as_account: 'link_as_account',
    signature: 'signature',
    work: 'work',
    subtype: 'subtype',
  },
};

describe('WebSocketConfirmation', () => {
  let webSocketConfirmation: WebSocketConfirmation;
  let managerMock: WebSocketManager;

  beforeEach(() => {
    managerMock = new WebSocketManager({
      url: 'http://example.com',
    });

    webSocketConfirmation = new WebSocketConfirmation(managerMock);
  });

  describe('subscribe', () => {
    let managerSubjectMock: Subject<unknown>;
    let confirmationHelperMock: WebSocketConfirmationHelper;

    beforeEach(() => {
      managerSubjectMock = new Subject();
      managerMock.subjectTopic = jest.fn().mockReturnValue(managerSubjectMock);
      confirmationHelperMock = new WebSocketConfirmationHelper();

      confirmationHelperMock.messageFilter = jest.fn().mockReturnValue(true);
      confirmationHelperMock.messageMapper = jest.fn().mockImplementation((message) => message);

      webSocketConfirmation = new WebSocketConfirmation(managerMock, confirmationHelperMock);
    });

    it('should get accounts and add subscription', () => {
      const params = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
        filter: {
          accounts: ['account1', 'account2'],
        },
      };

      const getAccountsToListenSpy = jest.spyOn(
        webSocketConfirmation,
        'getAccountsToListen' as any,
      );
      const addSubscriptionSpy = jest.spyOn(webSocketConfirmation, 'addSubscription' as any);
      const subscription = webSocketConfirmation.subscribe(params);

      expect(getAccountsToListenSpy).toHaveBeenCalledWith(params.filter);
      expect(addSubscriptionSpy).toHaveBeenCalledWith(['account1', 'account2']);

      subscription.unsubscribe();
    });

    it('should call filter and map correctly', () => {
      const params = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
        filter: {
          accounts: ['account1'],
        },
      };

      const subscription = webSocketConfirmation.subscribe(params);

      managerSubjectMock.next(confirmationMessage);

      expect(params.next).toHaveBeenCalledWith(
        confirmationHelperMock.messageMapper(confirmationMessage),
      );
      expect(confirmationHelperMock.messageFilter).toHaveBeenCalledWith(
        confirmationMessage,
        params.filter,
      );

      subscription.unsubscribe();
    });
  });

  describe('getAccountsToListen', () => {
    it('should return a list of unique accounts to listen from the filter', () => {
      const filter = {
        accounts: ['account1', 'account2', 'account1'],
        from: ['account2', 'account1', 'account3'],
        to: ['account4', 'account2'],
      };
      const accountsToListen = webSocketConfirmation['getAccountsToListen'](filter);
      expect(accountsToListen).toEqual(['account1', 'account2', 'account3', 'account4']);
    });

    it('should return undefined when no filters are applied', () => {
      const accountsToListen = webSocketConfirmation['getAccountsToListen']();
      expect(accountsToListen).toBeUndefined();
    });

    it('should return undefined when the filter object is empty', () => {
      const accountsToListen = webSocketConfirmation['getAccountsToListen']({});
      expect(accountsToListen).toBeUndefined();
    });
  });

  describe('addSubscription', () => {
    it('should create a subscription', () => {
      const accounts = ['account1', 'account2'];
      webSocketConfirmation['addSubscription'](accounts);

      expect(managerMock.subscribeTopic).toHaveBeenCalledTimes(1);
      expect(managerMock.subscribeTopic).toHaveBeenCalledWith({
        topic: 'confirmation',
        options: { accounts },
      });
      expect(webSocketConfirmation['subscriptionCount']).toBe(1);
    });

    it('should manage subscription counts and trigger webSocket methods appropriately ', () => {
      webSocketConfirmation['addSubscription'](['account1', 'account2']);

      // Should create the subscription
      expect(webSocketConfirmation['subscriptionCount']).toBe(1);
      expect(managerMock.subscribeTopic).toHaveBeenCalledTimes(1);
      expect(managerMock.subscribeTopic).toHaveBeenCalledWith({
        topic: 'confirmation',
        options: { accounts: ['account1', 'account2'] },
      });

      // Should update the subscription
      webSocketConfirmation['addSubscription'](['account1', 'account3', 'account4']);
      expect(webSocketConfirmation['subscriptionCount']).toBe(2);
      expect(managerMock.updateTopic).toHaveBeenCalledTimes(1);
      expect(managerMock.updateTopic).toHaveBeenCalledWith({
        topic: 'confirmation',
        options: { accounts_add: ['account3', 'account4'] },
      });

      // Should susbcribe to all
      webSocketConfirmation['addSubscription']();
      expect(webSocketConfirmation['subscriptionCount']).toBe(3);
      expect(managerMock.subscribeTopic).toHaveBeenCalledTimes(2);
      expect(managerMock.subscribeTopic).toHaveBeenCalledWith({
        topic: 'confirmation',
        options: undefined,
      });
    });

    it('should manage subscriptions to all when no accounts are provided', () => {
      webSocketConfirmation['addSubscription']();

      expect(managerMock.subscribeTopic).toHaveBeenCalledWith({
        topic: 'confirmation',
        options: undefined,
      });
    });
  });

  describe('removeSubscription', () => {
    it('should remove a subscription with accounts', () => {
      webSocketConfirmation['addSubscription'](['account1', 'account2']);
      webSocketConfirmation['removeSubscription'](['account1', 'account2']);

      // Expect update to not be called
      expect(managerMock.updateTopic).not.toHaveBeenCalled();

      // Expect unsubscribtion
      expect(managerMock.unsubscribeTopic).toHaveBeenCalledTimes(1);
      expect(managerMock.unsubscribeTopic).toHaveBeenCalledWith('confirmation');

      // Expect subscription count to be 0
      expect(webSocketConfirmation['subscriptionCount']).toBe(0);
    });

    it('should update the subscription when accounts are removed', () => {
      webSocketConfirmation['addSubscription'](['account1', 'account2', 'account3']);
      webSocketConfirmation['addSubscription'](['account1', 'account4', 'account5']);
      webSocketConfirmation['removeSubscription'](['account1', 'account4', 'account5']);

      // Expect update to be called
      expect(managerMock.updateTopic).toHaveBeenCalledTimes(2); // 2 times because of the 2 subscriptions
      expect(managerMock.updateTopic).toHaveBeenCalledWith({
        topic: 'confirmation',
        options: { accounts_del: ['account4', 'account5'] },
      });

      // Expect subscription count to be 1
      expect(webSocketConfirmation['subscriptionCount']).toBe(1);
    });

    it('should not update when subscrption to all are active', () => {
      webSocketConfirmation['addSubscription'](['account1', 'account2', 'account3']);
      webSocketConfirmation['addSubscription']();

      webSocketConfirmation['removeSubscription'](['account1', 'account2', 'account3']);

      // Expect update to not be called
      expect(managerMock.updateTopic).not.toHaveBeenCalled();

      // Expect subscription count to be 1
      expect(webSocketConfirmation['subscriptionCount']).toBe(1);
    });

    it('should remove subscription when no accounts are provided', () => {
      webSocketConfirmation['addSubscription']();
      webSocketConfirmation['addSubscription']();
      webSocketConfirmation['removeSubscription']();

      // Expect nothing to happen
      expect(managerMock.unsubscribeTopic).toHaveBeenCalledTimes(0);
      expect(webSocketConfirmation['subscriptionCount']).toBe(1);
      expect(webSocketConfirmation['subscriptionToAll']).toBe(1);

      webSocketConfirmation['removeSubscription']();

      // Expect unsubscribtion
      expect(managerMock.unsubscribeTopic).toHaveBeenCalledTimes(1);
      expect(managerMock.unsubscribeTopic).toHaveBeenCalledWith('confirmation');

      // Expect subscription count to be 0
      expect(webSocketConfirmation['subscriptionCount']).toBe(0);
      expect(webSocketConfirmation['subscriptionToAll']).toBe(0);
    });

    it('should subscribe to accounts when a subscription to all is removed', () => {
      webSocketConfirmation['addSubscription'](['account1', 'account2']);
      webSocketConfirmation['addSubscription'](['account1', 'account3']);
      webSocketConfirmation['addSubscription']();
      webSocketConfirmation['removeSubscription'](['account1']);
      webSocketConfirmation['removeSubscription']();

      // Expect subscription count to be 0
      expect(webSocketConfirmation['subscriptionCount']).toBe(1);

      // Expect subscription to all
      expect(managerMock.subscribeTopic).toHaveBeenCalledTimes(3);
      expect(managerMock.subscribeTopic).toHaveBeenNthCalledWith(2, {
        topic: 'confirmation',
      });
      expect(managerMock.subscribeTopic).toHaveBeenNthCalledWith(3, {
        topic: 'confirmation',
        options: { accounts: ['account1', 'account2', 'account3'] },
      });
    });
  });

  describe('addAccountsToListened', () => {
    it('should add accounts to the list of listened accounts', () => {
      webSocketConfirmation['addAccountsToListened'](['account1', 'account2']);
      expect(webSocketConfirmation['accountListened']).toEqual(
        new Map([
          ['account1', 1],
          ['account2', 1],
        ]),
      );

      webSocketConfirmation['addAccountsToListened'](['account1', 'account2', 'account3']);
      expect(webSocketConfirmation['accountListened']).toEqual(
        new Map([
          ['account1', 2],
          ['account2', 2],
          ['account3', 1],
        ]),
      );
    });

    it('should return the list of accounts added', () => {
      const result = webSocketConfirmation['addAccountsToListened']([
        'account1',
        'account1',
        'account2',
      ]);
      expect(result).toEqual(['account1', 'account2']);

      const result2 = webSocketConfirmation['addAccountsToListened']([
        'account1',
        'account2',
        'account3',
      ]);
      expect(result2).toEqual(['account3']);
    });
  });

  describe('removeAccountsFromListened', () => {
    it('should remove accounts from the list of listened accounts', () => {
      webSocketConfirmation['addAccountsToListened'](['account1', 'account2', 'account3']);
      webSocketConfirmation['removeAccountsFromListened'](['account1', 'account2']);
      expect(webSocketConfirmation['accountListened']).toEqual(new Map([['account3', 1]]));

      webSocketConfirmation['removeAccountsFromListened'](['account3']);
      expect(webSocketConfirmation['accountListened']).toEqual(new Map());
    });

    it('should return the list of accounts removed', () => {
      webSocketConfirmation['addAccountsToListened'](['account1', 'account2']);
      webSocketConfirmation['addAccountsToListened'](['account1', 'account2', 'account3']);
      const result = webSocketConfirmation['removeAccountsFromListened']([
        'account1',
        'account2',
        'account3',
      ]);
      expect(result).toEqual(['account3']);

      const result2 = webSocketConfirmation['removeAccountsFromListened'](['account1', 'account2']);
      expect(result2).toEqual(['account1', 'account2']);
    });

    it('should do nothing when the account is not in the list', () => {
      webSocketConfirmation['addAccountsToListened'](['account1', 'account2']);
      webSocketConfirmation['removeAccountsFromListened'](['account3']);
      expect(webSocketConfirmation['accountListened']).toEqual(
        new Map([
          ['account1', 1],
          ['account2', 1],
        ]),
      );
    });
  });
});
