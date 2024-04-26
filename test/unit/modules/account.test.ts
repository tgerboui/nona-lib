import { Subscription } from 'rxjs';

import { Account } from '../../../lib/modules/account/account';
import { ListenConfirmationParams } from '../../../lib/modules/account/account-interface';
import { NonaWebSocket } from '../../../lib/modules/websocket/websocket';
import { Rpc } from '../../../lib/services/rpc/rpc';

jest.mock('../../../lib/services/rpc/rpc');
jest.mock('../../../lib/modules/websocket/websocket');

describe('Account', () => {
  let account: Account;
  let rpcMock: jest.Mocked<Rpc>;
  let websocketMock: jest.Mocked<NonaWebSocket>;

  beforeEach(() => {
    rpcMock = new Rpc({ url: 'http://example.com' }) as jest.Mocked<Rpc>;
    websocketMock = new NonaWebSocket({ url: 'http://example.com' }) as jest.Mocked<NonaWebSocket>;
    account = new Account('nano_test-address', websocketMock, rpcMock);
  });

  describe('receivable', () => {
    it('should call rpc with correct parameters and return unsorted block hashes', async () => {
      const rpcResponse = { blocks: ['block1', 'block2'] };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.receivable();
      expect(rpcMock.call).toHaveBeenCalledWith('receivable', {
        account: 'nano_test-address',
        count: 100,
        sorting: false,
      });
      expect(result).toEqual(rpcResponse.blocks);
    });

    it('should call rpc with correct parameters and return sorted block values', async () => {
      const rpcResponse = { blocks: { block1: '100', block2: '200' } };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.receivable({ count: 2, sort: true });
      expect(rpcMock.call).toHaveBeenCalledWith('receivable', {
        account: 'nano_test-address',
        count: 2,
        sorting: true,
      });
      expect(result).toEqual(rpcResponse.blocks);
    });

    it('should return empty array if there is no receivable', async () => {
      const rpcResponse = { blocks: '' };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.receivable();
      expect(result).toEqual([]);
    });

    it('should return empty object if there is no receivable', async () => {
      const rpcResponse = { blocks: '' };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.receivable({ sort: true });
      expect(result).toEqual({});
    });
  });

  describe('info', () => {
    it('should fetch and process account info without representative and raw', async () => {
      const rpcResponse = {
        frontier: 'block-frontier',
        open_block: 'block-open',
        representative_block: 'block-rep',
        balance: '1000000000000000000000000000',
        modified_timestamp: '123456789',
        block_count: '10',
        account_version: '1',
        confirmation_height: '5',
        confirmation_height_frontier: 'block-confirmation',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.info();
      expect(rpcMock.call).toHaveBeenCalledWith('account_info', {
        representative: false,
        account: 'nano_test-address',
      });
      expect(result).toEqual({
        ...rpcResponse,
        // Convert balance to nano
        balance: '0.001',
      });
    });

    it('should fetch and process account info with representative and raw', async () => {
      const rpcResponse = {
        frontier: 'block-frontier',
        open_block: 'block-open',
        representative_block: 'block-rep',
        balance: '10000000000000000000000000000000000',
        modified_timestamp: '123456789',
        block_count: '10',
        account_version: '1',
        confirmation_height: '5',
        confirmation_height_frontier: 'block-confirmation',
        representative: 'nano_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.info({ representative: true, raw: true });
      expect(result).toEqual(rpcResponse);
    });
  });

  describe('balance', () => {
    it('should fetch and convert account balances', async () => {
      const rpcResponse = {
        balance: '1000000000000000000000000000',
        pending: '0',
        receivable: '200000000000000000000000000',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.balance();
      expect(rpcMock.call).toHaveBeenCalledWith('account_balance', {
        account: 'nano_test-address',
      });
      expect(result).toEqual({
        balance: '0.001',
        pending: '0',
        receivable: '0.0002',
      });
    });

    it('should return raw balance if raw is set to true', async () => {
      const rpcResponse = {
        balance: '1000000000000000000000000000',
        pending: '0',
        receivable: '200000000000000000000000000',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.balance({ raw: true });
      expect(result).toEqual(rpcResponse);
    });
  });

  describe('listenConfirmation', () => {
    it('should setup confirmation listener and return a subscription', () => {
      const subscriptionMock = {} as unknown as Subscription;
      websocketMock.confirmation.mockReturnValue(subscriptionMock);

      const params: ListenConfirmationParams = {
        next: jest.fn() as unknown as () => void,
        error: jest.fn() as unknown as () => void,
        complete: jest.fn() as unknown as () => void,
        filter: { subtype: ['send'], to: ['nano_test-to'] },
      };
      const result = account.listenConfirmation(params);

      expect(websocketMock.confirmation).toHaveBeenCalledWith({
        ...params,
        filter: { ...params.filter, accounts: ['nano_test-address'] },
      });
      expect(result).toBe(subscriptionMock);
    });
  });

  describe('history', () => {
    it('should fetch and return account history', async () => {
      const rpcResponse = {
        account: 'nano_test-address',
        history: [
          {
            type: 'send',
            account: 'nano_test-address',
            amount: '1000000000000000000000000000',
            hash: 'block-hash',
            local_timestamp: '123456789',
            height: '10',
          },
          {
            type: 'receive',
            account: 'nano_test-address',
            amount: '1000000000000000000000000000',
            hash: 'block-hash',
            local_timestamp: '123456789',
            height: '9',
          },
        ],
        previous: 'block-previous',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.history();

      expect(rpcMock.call).toHaveBeenCalledWith('account_history', {
        account: 'nano_test-address',
        count: 100,
        raw: false,
      });

      const historyResponse = {
        history: [
          {
            type: 'send',
            account: 'nano_test-address',
            amount: '0.001',
            hash: 'block-hash',
            local_timestamp: 123456789,
            height: 10,
          },
          {
            type: 'receive',
            account: 'nano_test-address',
            amount: '0.001',
            hash: 'block-hash',
            local_timestamp: 123456789,
            height: 9,
          },
        ],
        previous: 'block-previous',
      };
      expect(result).toEqual(historyResponse);
    });

    it('should fetch and return raw account history', async () => {
      const rpcResponse = {
        account: 'nano_test-address',
        history: [
          {
            type: 'send',
            account: 'nano_test-address',
            amount: '1000000000000000000000000000',
            hash: 'block-hash',
            local_timestamp: '123456789',
            height: '10',
            representative: 'test-rep',
            link: 'block-link',
            previous: 'block-previous',
            balance: '1000000000000000000000000000',
            subtype: 'send',
            confirmed: 'true',
            work: 'work',
            signature: 'signature',
          },
          {
            type: 'receive',
            account: 'nano_test-address',
            amount: '1000000000000000000000000000',
            hash: 'block-hash',
            local_timestamp: '123456789',
            height: '9',
            representative: 'test-rep',
            link: 'block-link',
            previous: 'block-previous',
            balance: '1000000000000000000000000000',
            subtype: 'receive',
            confirmed: 'true',
            work: 'work',
            signature: 'signature',
          },
        ],
        previous: 'block-previous',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.history({ count: 2, raw: true });

      expect(rpcMock.call).toHaveBeenCalledWith('account_history', {
        account: 'nano_test-address',
        count: 2,
        raw: true,
      });

      const historyResponse = {
        history: [
          {
            type: 'send',
            account: 'nano_test-address',
            amount: '1000000000000000000000000000',
            hash: 'block-hash',
            local_timestamp: 123456789,
            height: 10,
            representative: 'test-rep',
            link: 'block-link',
            previous: 'block-previous',
            balance: '1000000000000000000000000000',
            subtype: 'send',
            confirmed: true,
            work: 'work',
            signature: 'signature',
          },
          {
            type: 'receive',
            account: 'nano_test-address',
            amount: '1000000000000000000000000000',
            hash: 'block-hash',
            local_timestamp: 123456789,
            height: 9,
            representative: 'test-rep',
            link: 'block-link',
            previous: 'block-previous',
            balance: '1000000000000000000000000000',
            subtype: 'receive',
            confirmed: true,
            work: 'work',
            signature: 'signature',
          },
        ],
        previous: 'block-previous',
      };
      expect(result).toEqual(historyResponse);
    });
  });

  describe('blockCount', () => {
    it('should fetch and return the number of blocks', async () => {
      const rpcResponse = { block_count: '10' };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.blockCount();
      expect(rpcMock.call).toHaveBeenCalledWith('account_block_count', {
        account: 'nano_test-address',
      });
      expect(result).toBe(10);
    });
  });

  describe('representative', () => {
    it('should return the representative of the account', async () => {
      const rpcResponse = {
        frontier: 'block-frontier',
        open_block: 'block-open',
        representative_block: 'block-rep',
        balance: '10000000000000000000000000000000000',
        modified_timestamp: '123456789',
        block_count: '10',
        account_version: '1',
        confirmation_height: '5',
        confirmation_height_frontier: 'block-confirmation',
        representative: 'nano_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3',
      };
      rpcMock.call.mockResolvedValue(rpcResponse);

      const result = await account.representative();
      expect(result).toBe(rpcResponse.representative);
    });
  });

  describe('weight', () => {
    it('should return the weight of the account in nano unit', async () => {
      rpcMock.call.mockResolvedValue({ weight: '1000000000000000000000000000' });
      const result = await account.weight();
      expect(result).toBe('0.001');
    });

    it('should return the weight of the account in raw unit', async () => {
      rpcMock.call.mockResolvedValue({ weight: '1000000000000000000000000000' });
      const result = await account.weight({ raw: true });
      expect(result).toBe('1000000000000000000000000000');
    });
  });
});
