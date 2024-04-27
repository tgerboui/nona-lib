/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from 'rxjs';

import { Blocks } from '../../../lib/modules/blocks/blocks';
import { Wallet } from '../../../lib/modules/wallet/wallet';
import { NonaWebSocket } from '../../../lib/modules/websocket/websocket';
import { KeyService } from '../../../lib/services/hash/key-service';
import { NameService } from '../../../lib/services/name/name-service';
import { Rpc } from '../../../lib/services/rpc/rpc';
import { NonaUserError } from '../../../lib/shared/errors/user-error';

jest.mock('../../../lib/services/rpc/rpc');
jest.mock('../../../lib/modules/blocks/blocks');
jest.mock('../../../lib/modules/websocket/websocket');
jest.mock('../../../lib/services/hash/key-service');

describe('Wallet class', () => {
  const keyServiceMock = KeyService as jest.Mocked<typeof KeyService>;
  let nameServiceMock: NameService;
  let wallet: Wallet;
  let rpcMock: jest.Mocked<Rpc>;
  let blocksMock: jest.Mocked<Blocks>;
  let websocketMock: jest.Mocked<NonaWebSocket>;
  const privateKey = 'privateKey';

  beforeEach(() => {
    keyServiceMock.getPublicKey.mockReturnValue('publicKey');
    keyServiceMock.getAddress.mockReturnValue('nano_address');

    nameServiceMock = new NameService();
    jest.spyOn(nameServiceMock, 'resolveUsername').mockResolvedValue('nano_resolved_address');

    rpcMock = new Rpc({ url: 'http://example.com' }) as jest.Mocked<Rpc>;
    blocksMock = new Blocks(rpcMock) as jest.Mocked<Blocks>;
    websocketMock = new NonaWebSocket({ url: 'http://example.com' }) as jest.Mocked<NonaWebSocket>;
    wallet = new Wallet(nameServiceMock, privateKey, blocksMock, rpcMock, websocketMock);
  });

  it('should initialize properties correctly', () => {
    expect(wallet.publicKey).toEqual('publicKey');
    expect(wallet.address).toEqual('nano_address');
  });

  describe('open', () => {
    it('should open an account and return the hash of the opened block', async () => {
      const lastHashes = { blockHash: '100' };
      wallet.receivable = jest.fn().mockResolvedValue(lastHashes);
      blocksMock.create.mockResolvedValue({ hash: 'createdHash' } as any);
      blocksMock.process.mockResolvedValue('processedHash');

      const result = await wallet.open('nano_representative');
      expect(wallet.receivable).toHaveBeenCalledWith({ count: 1, sort: true });
      expect(blocksMock.create).toHaveBeenCalledWith({
        previous: '0',
        representative: 'nano_representative',
        account: 'nano_address',
        link: 'blockHash',
        balance: '100',
        key: privateKey,
      });
      expect(blocksMock.process).toHaveBeenCalledWith({ hash: 'createdHash' }, 'open');
      expect(result).toBe('processedHash');
    });

    it('should throw an error if no receivable blocks are available', async () => {
      wallet.receivable = jest.fn().mockResolvedValue({});
      await expect(wallet.open('nano_representative')).rejects.toThrow(NonaUserError);
      await expect(wallet.open('nano_representative')).rejects.toThrow('No receivable blocks');
    });
  });

  describe('receive', () => {
    it('should fetch receivable transaction if no hash is provided', async () => {
      wallet.receivable = jest.fn().mockResolvedValue(['transactionHash']);
      wallet['receiveHash'] = jest.fn().mockResolvedValue('receivedHash');

      const result = await wallet.receive();
      expect(wallet.receivable).toHaveBeenCalledWith({ count: 1 });
      expect(wallet['receiveHash']).toHaveBeenCalledWith('transactionHash');
      expect(result).toEqual('receivedHash');
    });

    it('should return the the value of receiveHash', async () => {
      wallet['receiveHash'] = jest.fn().mockResolvedValue('receivedHash');

      const result = await wallet.receive('transactionHash');
      expect(wallet['receiveHash']).toHaveBeenCalledWith('transactionHash');
      expect(result).toEqual('receivedHash');
    });

    it('should call receive with the hash provided', async () => {
      wallet['receiveHash'] = jest.fn();

      await wallet.receive('transactionHash');
      expect(wallet['receiveHash']).toHaveBeenCalledWith('transactionHash');
    });

    it('should return null if no receivable transaction is available', async () => {
      wallet.receivable = jest.fn().mockResolvedValue([]);
      const result = await wallet.receive();
      expect(result).toBeNull();
    });
  });

  describe('receiveHash', () => {
    it('should receive a pending transaction and return the hash of the received block', async () => {
      const info = {
        balance: '1000000000000000000000000000000',
        frontier: 'frontierHash',
        representative: 'nano_representative',
      };
      const hashInfo = { amount: '5000000000000000000000000000000' };
      wallet.info = jest.fn().mockResolvedValue(info);
      blocksMock.info.mockResolvedValue(hashInfo as any);
      blocksMock.receiveBlock.mockResolvedValue('processedReceiveHash');

      const result = await wallet['receiveHash']('transactionHash');
      expect(wallet.info).toHaveBeenCalledWith({
        representative: true,
        raw: true,
      });
      expect(blocksMock.receiveBlock).toHaveBeenCalledWith({
        account: 'nano_address',
        previous: 'frontierHash',
        representative: 'nano_representative',
        balance: '6000000000000000000000000000000',
        link: 'transactionHash',
        key: 'privateKey',
      });
      expect(result).toBe('processedReceiveHash');
    });
  });

  describe('receiveMultipleTransactions', () => {
    it('should call receveiveHashes', () => {
      wallet['receiveHashes'] = jest.fn();
      wallet.receiveMultipleTransactions(['hash1', 'hash2']);
      expect(wallet['receiveHashes']).toHaveBeenCalledWith(['hash1', 'hash2']);
    });
  });

  describe('receiveAll', () => {
    it('should call receiveHashes if hashes are provided', async () => {
      const hashes = ['hash1', 'hash2'];
      wallet.receivable = jest.fn();
      wallet['receiveHashes'] = jest.fn().mockResolvedValue(['receivedHash1', 'receivedHash2']);

      const result = await wallet.receiveAll(hashes);
      expect(wallet.receivable).not.toHaveBeenCalled();
      expect(wallet['receiveHashes']).toHaveBeenCalledWith(['hash1', 'hash2']);
      expect(result).toEqual(['receivedHash1', 'receivedHash2']);
    });

    it('should fetch receivable transactions if no hashes are provided', async () => {
      wallet.receivable = jest
        .fn()
        .mockResolvedValueOnce(['hash1', 'hash2'])
        .mockResolvedValueOnce([]);
      wallet['receiveHashes'] = jest.fn().mockResolvedValue(['receivedHash1', 'receivedHash2']);

      const result = await wallet.receiveAll();
      expect(wallet.receivable).toHaveBeenCalledWith({ count: 100 });
      expect(wallet['receiveHashes']).toHaveBeenCalledWith(['hash1', 'hash2']);
      expect(result).toEqual(['receivedHash1', 'receivedHash2']);
    });

    it('should fetch receivable while there are still transactions to receive', async () => {
      wallet.receivable = jest
        .fn()
        .mockResolvedValueOnce(['hash1', 'hash2'])
        .mockResolvedValueOnce(['hash3'])
        .mockResolvedValueOnce([]);
      wallet['receiveHashes'] = jest.fn().mockResolvedValue(['receivedHash1', 'receivedHash2']);

      const result = await wallet.receiveAll();
      expect(wallet.receivable).toHaveBeenCalledTimes(3);
      expect(wallet['receiveHashes']).toHaveBeenCalledTimes(2);
      expect(wallet['receiveHashes']).toHaveBeenNthCalledWith(1, ['hash1', 'hash2']);
      expect(wallet['receiveHashes']).toHaveBeenNthCalledWith(2, ['hash3']);
      expect(result).toEqual(['receivedHash1', 'receivedHash2', 'receivedHash1', 'receivedHash2']);
    });

    it('should handle the case when there are no receivable transactions initially', async () => {
      wallet.receivable = jest.fn().mockResolvedValue([]);
      wallet['receiveHashes'] = jest.fn();

      const result = await wallet.receiveAll();
      expect(wallet.receivable).toHaveBeenCalledWith({ count: 100 });
      expect(wallet['receiveHashes']).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('receiveHashes', () => {
    it('should return an empty array if no hashes are provided', async () => {
      const result = await wallet['receiveHashes']([]);
      expect(result).toEqual([]);
    });

    it('should receive multiple transactions and return hashes of the received blocks', async () => {
      const info = {
        balance: '1000000000000000000000000000000',
        frontier: 'frontierHash',
        representative: 'nano_representative',
      };
      const hashInfo = { amount: '2000000000000000000000000000000' };
      wallet.info = jest.fn().mockResolvedValue(info);
      blocksMock.info.mockResolvedValue(hashInfo as any);
      blocksMock.receiveBlock.mockResolvedValue('processedHash');

      const hashes = ['hash1', 'hash2'];
      const result = await wallet['receiveHashes'](hashes);

      expect(wallet.info).toHaveBeenCalledTimes(1);
      expect(blocksMock.info).toHaveBeenCalledTimes(hashes.length);
      expect(blocksMock.receiveBlock).toHaveBeenCalledTimes(hashes.length);
      expect(blocksMock.receiveBlock).toHaveBeenNthCalledWith(1, {
        account: 'nano_address',
        previous: 'frontierHash',
        representative: 'nano_representative',
        balance: '3000000000000000000000000000000',
        link: 'hash1',
        key: privateKey,
      });
      expect(blocksMock.receiveBlock).toHaveBeenNthCalledWith(2, {
        account: 'nano_address',
        previous: 'processedHash',
        representative: 'nano_representative',
        balance: '5000000000000000000000000000000',
        link: 'hash2',
        key: privateKey,
      });
      expect(result).toEqual(['processedHash', 'processedHash']);
    });
  });

  describe('send', () => {
    it('should send a transaction to the specified address and return the hash of the sent block', async () => {
      const info = {
        balance: '5000000000000000000000000000000',
        frontier: 'frontierHash',
        representative: 'nano_representative',
      };
      wallet.info = jest.fn().mockResolvedValue(info);
      blocksMock.create.mockResolvedValue({ hash: 'createdSendHash' } as any);
      blocksMock.process.mockResolvedValue('processedSendHash');
      KeyService.getPublicKey = jest.fn().mockReturnValue('publicKey');

      const result = await wallet.send('nano_destinationAddress', '1');
      expect(wallet.info).toHaveBeenCalledWith({
        representative: true,
        raw: true,
      });
      expect(blocksMock.create).toHaveBeenCalledWith({
        account: 'nano_address',
        previous: 'frontierHash',
        representative: 'nano_representative',
        balance: '4000000000000000000000000000000', // Adjusted for unit conversion in test setup
        link: 'publicKey',
        key: privateKey,
      });
      expect(KeyService.getPublicKey).toHaveBeenCalledWith('destinationAddress');
      expect(blocksMock.process).toHaveBeenCalledWith({ hash: 'createdSendHash' }, 'send');
      expect(result).toBe('processedSendHash');
    });

    it('should throw a NonaUserError if the amount is not a valid number', async () => {
      await expect(wallet.send('nano_destinationAddress', '')).rejects.toThrow(NonaUserError);
      await expect(wallet.send('nano_destinationAddress', '')).rejects.toThrow('Invalid amount');
      await expect(wallet.send('nano_destinationAddress', '-12')).rejects.toThrow(NonaUserError);
      await expect(wallet.send('nano_destinationAddress', '-12')).rejects.toThrow('Invalid amount');
      await expect(wallet.send('nano_destinationAddress', '0')).rejects.toThrow(NonaUserError);
      await expect(wallet.send('nano_destinationAddress', '0')).rejects.toThrow('Invalid amount');
    });

    it('sould throw a NonaUserError if the balance of the acount is insufficient', async () => {
      const info = {
        balance: '0',
        frontier: 'frontierHash',
        representative: 'nano_representative',
      };
      wallet.info = jest.fn().mockResolvedValue(info);

      await expect(wallet.send('nano_destinationAddress', '1')).rejects.toThrow(NonaUserError);
      await expect(wallet.send('nano_destinationAddress', '1')).rejects.toThrow(
        'Insufficient balance',
      );
    });
  });

  describe('listenAndReceive', () => {
    it('should setup confirmation listener and automatically receive transactions', async () => {
      const subscriptionMock = new Subscription();
      const block = { hash: 'blockHash' };
      wallet['receiveHash'] = jest
        .fn()
        .mockResolvedValueOnce('receivedHash')
        .mockRejectedValueOnce('error');
      wallet.listenConfirmation = jest.fn().mockReturnValue(subscriptionMock);

      const result = wallet.listenAndReceive();
      const callback = (wallet.listenConfirmation as jest.Mock).mock.calls[0][0].next;
      await callback(block);
      await callback(block);

      expect(wallet.listenConfirmation).toHaveBeenCalledWith({
        next: expect.any(Function),
        error: undefined,
        complete: undefined,
        filter: {
          to: [wallet.address],
          subtype: ['send'],
        },
      });
      expect(wallet['receiveHash']).toHaveBeenCalledWith('blockHash');
      expect(result).toBe(subscriptionMock);
    });

    it('should setup confirmation listener and automatically receive transactions and send the block to the callback', async () => {
      const subscriptionMock = new Subscription();
      const block = { hash: 'blockHash' };
      wallet['receiveHash'] = jest.fn().mockResolvedValue('receivedHash');
      wallet.listenConfirmation = jest.fn().mockReturnValue(subscriptionMock);
      const params = { next: jest.fn(), error: jest.fn() };

      const result = wallet.listenAndReceive(params);
      const callback = (wallet.listenConfirmation as jest.Mock).mock.calls[0][0].next;
      await callback(block);

      expect(wallet.listenConfirmation).toHaveBeenCalledWith({
        next: expect.any(Function),
        error: expect.any(Function),
        complete: undefined,
        filter: {
          to: [wallet.address],
          subtype: ['send'],
        },
      });
      expect(wallet['receiveHash']).toHaveBeenCalledWith('blockHash');
      expect(params.next).toHaveBeenCalledWith(block);
      expect(result).toBe(subscriptionMock);
    });

    it('should handle error to the error callback', async () => {
      const subscriptionMock = new Subscription();
      const block = { hash: 'blockHash' };
      wallet['receiveHash'] = jest.fn().mockRejectedValueOnce('error');
      wallet.listenConfirmation = jest.fn().mockReturnValue(subscriptionMock);
      const params = { next: jest.fn(), error: jest.fn() };

      const result = wallet.listenAndReceive(params);
      const callback = (wallet.listenConfirmation as jest.Mock).mock.calls[0][0].next;
      await callback(block);

      expect(wallet.listenConfirmation).toHaveBeenCalledWith({
        next: expect.any(Function),
        error: expect.any(Function),
        complete: undefined,
        filter: {
          to: [wallet.address],
          subtype: ['send'],
        },
      });
      expect(wallet['receiveHash']).toHaveBeenCalledWith('blockHash');
      expect(params.error).toHaveBeenCalledWith('error');
      expect(result).toBe(subscriptionMock);
    });
  });

  describe('change', () => {
    it('should change the representative of the account and return the hash of the changed block', async () => {
      const info = { balance: '1000', frontier: 'frontierHash' };
      wallet.info = jest.fn().mockResolvedValue(info);
      blocksMock.create.mockResolvedValue({ hash: 'createdChangeHash' } as any);
      blocksMock.process.mockResolvedValue('processedChangeHash');

      const result = await wallet.change('nano_newRepresentative');
      expect(wallet.info).toHaveBeenCalledWith({
        raw: true,
      });
      expect(blocksMock.create).toHaveBeenCalledWith({
        account: 'nano_address',
        previous: 'frontierHash',
        representative: 'nano_newRepresentative',
        balance: '1000',
        link: '0',
        key: privateKey,
      });
      expect(blocksMock.process).toHaveBeenCalledWith({ hash: 'createdChangeHash' }, 'change');
      expect(result).toBe('processedChangeHash');
    });
  });
});
