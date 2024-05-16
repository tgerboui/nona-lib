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
        account: 'nano_1t7qkq38d8imy6hoin48ywxpokorxoh8kqz4zntxk6c4qkpsznhitda4a5wo',
        previous: '572F88AD2B09D9A776BFF7D348FA18B302FC218C8DDD1FDCEA8F7B6F85C98552',
        representative: 'nano_1tx1oxyczf9mczjnw8k8fktydjekry57aeet8f9cyxtpg9uf56owy4iup6ad',
        balance: '1000',
        privateKey: '684E8D92908E9A86E68EFCE6A53F723693DFFF8DB7D24CC1B92CF70AE46B8D00',
        link: 'EF7C0B9747FAE586258DFC3674200C432E997C3991DEA7B33EF0097E67516316',
        work: '2b3d689bbcb21dca',
      };
      const { privateKey, ...createParamsWithoutKey } = createParams;

      blocks.hash = jest
        .fn()
        .mockReturnValue('C5390ECDDA5B0749EAEA1BCEC6B8CB36D10518E5A92E64A7DB59C26574EA1CC4');
      blocks.sign = jest
        .fn()
        .mockReturnValue(
          'B3889F33CBDEB33B4066C32D0D1A1506D37C699090ED19E9793E291BA2240236528DF95B52A1E2AE24BFB67BF348A0730D9B7EFB72350663BF7DA2B179D48F06',
        );

      const result = blocks.create(createParams);

      expect(blocks.hash).toHaveBeenCalledWith(createParamsWithoutKey);
      expect(blocks.sign).toHaveBeenCalledWith({
        hash: 'C5390ECDDA5B0749EAEA1BCEC6B8CB36D10518E5A92E64A7DB59C26574EA1CC4',
        privateKey: '684E8D92908E9A86E68EFCE6A53F723693DFFF8DB7D24CC1B92CF70AE46B8D00',
      });
      expect(result).toEqual({
        ...createParamsWithoutKey,
        type: 'state',
        signature:
          'B3889F33CBDEB33B4066C32D0D1A1506D37C699090ED19E9793E291BA2240236528DF95B52A1E2AE24BFB67BF348A0730D9B7EFB72350663BF7DA2B179D48F06',
      });
    });
  });

  describe('process', () => {
    it('should call process RPC method with the provided block and subtype, and parse the result', async () => {
      const block: Block['block'] = {
        type: 'state',
        account: 'nano_14oegg6hq5c1smq7hh1ht3m3sfc17d6u47tur6q5d8a6m7whjxgwr7mggaoo',
        previous: 'C5390ECDDA5B0749EAEA1BCEC6B8CB36D10518E5A92E64A7DB59C26574EA1CC4',
        representative: 'nano_3wmfn39dj8iz1hizuxe1jr6ggs1eqp3mpf9orj88hm8jtfap7epzgrn7x997',
        balance: '1000',
        link: 'A3B6E7535ABB4E765AB24E32639F1651BC05C77A67595031C061C6D7A6E947B2',
        link_as_account: 'nano_3axpwxboogtggsfd6mjkeghjenfw1q5qnstsc1rw1rg8tymgkjxkg9wxbeun',
        signature:
          '0713BF2715CA7B5CA6F5AAB9082418B1F76BC7724A3CCDD269DD6FABD60B2F5C832127FB9E99B69E1C647BF8940547D3E7DD06CC1E22F388F14E52920DED8705',
        work: '2b3d689bbcb21dca',
      };
      const processResponse: Block = {
        block,
        hash: 'C2390ECDDA5B4749EAEA1BCEC6B8CB36D10518E5A92E64A7DB59C26574EA1CC4',
      };
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
        block_account: 'nano_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est',
        amount: '30000000000000000000000000000000000',
        balance: '5606157000000000000000000000000000000',
        height: '58',
        local_timestamp: '1713527539',
        successor: '8D3AB98B301224253750D448B4BD997132400CEDD0A8432F775724F2D9821C72',
        confirmed: 'true',
        contents: {
          type: 'state',
          account: 'nano_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est',
          previous: 'CE898C131AAEE25E05362F247760F8A3ACF34A9796A5AE0D9204E86B0637965E',
          representative: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
          balance: '5606157000000000000000000000000000000',
          link: '5D1AA8A45F8736519D707FCB375976A7F9AF795091021D7E9C7548D6F45DD8D5',
          link_as_account: 'nano_1qato4k7z3spc8gq1zyd8xeqfbzsoxwo36a45ozbrxcatut7up8ohyardu1z',
          signature:
            '82D41BC16F313E4B2243D14DFFA2FB04679C540C2095FEE7EAE0F2F26880AD56DD48D87A7CC5DD760C5B2D76EE2C205506AA557BF00B60D8DEE312EC7343A501',
          work: '8a142e07a10996d5',
        },
        subtype: 'send',
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
      hashBlockMock.mockReturnValue(
        '87434F8041869A01C8F6F263B87972D7BA443A72E0A97D7A3FD0CCC2358FD6F9',
      );

      const params = {
        previous: 'FF0144381CFF0B2C079A115E7ADA7E96F43FD219446E7524C48D1CC9900C4F17',
      };
      const result = blocks.hash(params as any);

      expect(hashBlock).toHaveBeenCalledWith(params);
      expect(result).toBe('87434F8041869A01C8F6F263B87972D7BA443A72E0A97D7A3FD0CCC2358FD6F9');
    });

    it('should convert previous if it is equal to 0', () => {
      hashBlockMock.mockReturnValue(
        '87434F8041869A01C8F6F263B87972D7BA443A72E0A97D7A3FD0CCC2358FD6F9',
      );

      const params = { previous: '0' };
      const result = blocks.hash(params as any);

      expect(hashBlock).toHaveBeenCalledWith({
        previous: '0000000000000000000000000000000000000000000000000000000000000000',
      });
      expect(result).toBe('87434F8041869A01C8F6F263B87972D7BA443A72E0A97D7A3FD0CCC2358FD6F9');
    });
  });

  describe('sign', () => {
    let signBlockMock: jest.Mock;
    beforeEach(() => {
      signBlockMock = signBlock as any;
    });

    it('should sign a block using signBlock from nanocurrency package', () => {
      signBlockMock.mockReturnValue(
        '3BFBA64A775550E6D49DF1EB8EEC2136DCD74F090E2ED658FBD9E80F17CB1C9F9F7BDE2B93D95558EC2F277FFF15FD11E6E2162A1714731B743D1E941FA4560A',
      );

      const result = blocks.sign({
        hash: 'FF0144381CFF0B2C079A115E7ADA7E96F43FD219446E7524C48D1CC9900C4F17',
        privateKey: '696529D5C661226BC7AE674B05950A58F1954DADFD53B1ABF0AC633BF1EDA87A',
      });
      expect(signBlockMock).toHaveBeenCalledWith({
        hash: 'FF0144381CFF0B2C079A115E7ADA7E96F43FD219446E7524C48D1CC9900C4F17',
        secretKey: '696529D5C661226BC7AE674B05950A58F1954DADFD53B1ABF0AC633BF1EDA87A',
      });
      expect(result).toBe(
        '3BFBA64A775550E6D49DF1EB8EEC2136DCD74F090E2ED658FBD9E80F17CB1C9F9F7BDE2B93D95558EC2F277FFF15FD11E6E2162A1714731B743D1E941FA4560A',
      );
    });
  });
});
