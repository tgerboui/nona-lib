import { hashBlock, signBlock } from 'nanocurrency';
import { Blocks } from '../../../lib/modules/blocks/blocks';
import { CreateBlockParams } from '../../../lib/modules/blocks/blocks-interface';
import { Block, BlockInfo } from '../../../lib/modules/blocks/blocks-schema';
import { Rpc } from '../../../lib/services/rpc/rpc';

jest.mock('nanocurrency', () => ({
  ...jest.requireActual('nanocurrency'),
  hashBlock: jest.fn(),
  signBlock: jest.fn(),
}));

// TODO: separate all mthods tests in describe blocks
describe('Blocks', () => {
  let blocks: Blocks;
  const rpcCallMock = jest.fn();
  const rpcMock = { call: rpcCallMock } as unknown as Rpc;

  beforeEach(() => {
    rpcCallMock.mockClear();
    blocks = new Blocks(rpcMock);
  });

  it('should create an instance of Blocks', () => {
    expect(blocks).toBeInstanceOf(Blocks);
  });

  describe('count', () => {
    it('should call block_count RPC method and parse the result', async () => {
      const countResponse = { count: '10', unchecked: '5', cemented: '5' };
      rpcCallMock.mockResolvedValue(countResponse);

      const result = await blocks.count();

      expect(rpcCallMock).toHaveBeenCalledWith('block_count');
      expect(result).toEqual(countResponse);
    });
  });

  describe('create', () => {
    it('should hash and sign the block the the provided params and private key', async () => {
      const createParams: CreateBlockParams = {
        account: 'nano_account',
        previous: 'previousHash',
        representative: 'nano_representative',
        balance: '1000',
        privateKey: 'privateKey',
        link: 'link',
        work: 'work',
      };
      const { privateKey, ...createParamsWithoutKey } = createParams;

      blocks.hash = jest.fn().mockReturnValue('hash');
      blocks.sign = jest.fn().mockReturnValue('signature');

      const result = blocks.create(createParams);

      expect(blocks.hash).toHaveBeenCalledWith(createParamsWithoutKey);
      expect(blocks.sign).toHaveBeenCalledWith({ hash: 'hash', privateKey: 'privateKey' });
      expect(result).toEqual({
        ...createParamsWithoutKey,
        type: 'state',
        signature: 'signature',
      });
    });
  });

  describe('process', () => {
    it('should call process RPC method with the provided block and subtype, and parse the result', async () => {
      const block: Block['block'] = {
        type: 'state',
        account: 'nano_address',
        previous: 'previousHash',
        representative: 'nano_representative',
        balance: '1000',
        link: 'link',
        link_as_account: 'nano_linkAsAccount',
        signature: 'signature',
        work: 'work',
      };
      const processResponse: Block = { block, hash: 'processedHash' };
      const subtype = 'send';
      rpcCallMock.mockResolvedValue(processResponse);

      const result = await blocks.process(block, subtype);

      expect(rpcCallMock).toHaveBeenCalledWith('process', {
        json_block: 'true',
        subtype,
        block,
      });
      expect(result).toEqual(processResponse.hash);
    });
  });

  describe('info', () => {
    it('should call block_info RPC method with the provided hash and parse the result', async () => {
      const hash = 'blockHash';
      const infoResponse = {
        block_account: 'nano_1t7qkq38d8imy6hoin48ywxpokorxoh8kqz4zntxk6c4qkpsznhitda4a5wo',
        amount: 'amount',
        balance: 'balance',
        height: 'height',
        local_timestamp: '1713527539',
        successor: 'successor',
        confirmed: 'confirmed',
        contents: {
          type: 'type',
          account: 'nano_1t7qkq38d8imy6hoin48ywxpokorxoh8kqz4zntxk6c4qkpsznhitda4a5wo',
          previous: 'previous',
          representative: 'nano_1tx1oxyczf9mczjnw8k8fktydjekry57aeet8f9cyxtpg9uf56owy4iup6ad',
          balance: 'balance',
          link: 'link',
          link_as_account: 'nano_3barjiyag1agq4akumc4hstgmjiqd5mhi81y5enkwh95srs76q4fy1j8u4ie',
          signature: 'signature',
          work: 'work',
        },
        subtype: 'subtype',
      };
      rpcCallMock.mockResolvedValue(infoResponse);

      const result = await blocks.info(hash);

      expect(rpcCallMock).toHaveBeenCalledWith('block_info', {
        json_block: 'true',
        hash,
      });
      expect(result).toEqual(BlockInfo.parse(infoResponse));
    });
  });

  describe('receiveBlock', () => {
    it('should call create and process process', async () => {
      const createParams = { param: 'param' };
      const block = { block: 'block' };
      const processResponse = { response: 'response' };
      blocks.create = jest.fn().mockReturnValue(block);
      blocks.process = jest.fn().mockResolvedValue(processResponse);

      const result = await blocks.receiveBlock(createParams as unknown as CreateBlockParams);
      expect(blocks.create).toHaveBeenCalledWith({ param: 'param' });
      expect(blocks.process).toHaveBeenCalledWith({ block: 'block' }, 'receive');
      expect(result).toEqual({ response: 'response' });
    });
  });

  describe('hash', () => {
    let hashBlockMock: jest.Mock;
    beforeEach(() => {
      hashBlockMock = hashBlock as any;
    });

    it('should hash using hashBlock from nanocurrency package', () => {
      hashBlockMock.mockReturnValue('hash');

      const params = { previous: 'previous' };
      const result = blocks.hash(params as any);

      expect(hashBlock).toHaveBeenCalledWith(params);
      expect(result).toBe('hash');
    });

    it('should convert previous if it is equal to 0', () => {
      hashBlockMock.mockReturnValue('hash');

      const params = { previous: '0' };
      const result = blocks.hash(params as any);

      expect(hashBlock).toHaveBeenCalledWith({
        previous: '0000000000000000000000000000000000000000000000000000000000000000',
      });
      expect(result).toBe('hash');
    });
  });

  describe('sign', () => {
    let signBlockMock: jest.Mock;
    beforeEach(() => {
      signBlockMock = signBlock as any;
    });

    it('should sign a block using signBlock from nanocurrency package', () => {
      signBlockMock.mockReturnValue('signature');

      const result = blocks.sign({ hash: 'hash', privateKey: 'privateKey' });
      expect(signBlockMock).toHaveBeenCalledWith({ hash: 'hash', secretKey: 'privateKey' });
      expect(result).toBe('signature');
    });
  });
});
