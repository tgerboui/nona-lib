import { Work } from '../../../lib/modules/work/work';

describe('Work class', () => {
  let work: Work;
  let rpcMock: any;

  beforeEach(() => {
    rpcMock = {
      call: jest.fn(),
    };
    work = new Work(rpcMock);
  });

  describe('generate', () => {
    it('should call the RPC method with the correct parameters and return the generated work', async () => {
      const hash = 'abc123';
      const generatedWork = {
        work: '2b3d689bbcb21dca',
        difficulty: 'fffffff93c41ec94',
        multiplier: '1.182623871097636',
        hash: '718CC2121C3E641059BC1C2CFC45666C99E8AE922F7A807B7D07B62C995D79E2',
      };

      rpcMock.call.mockResolvedValue(generatedWork);

      const result = await work.generate(hash);

      expect(rpcMock.call).toHaveBeenCalledWith('work_generate', { hash });
      expect(result).toEqual(generatedWork);
    });
  });
});
