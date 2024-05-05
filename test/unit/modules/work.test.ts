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
        work: 'work',
        difficulty: 'difficulty',
        multiplier: 'multiplier',
        hash: 'hash',
      };

      rpcMock.call.mockResolvedValue(generatedWork);

      const result = await work.generate(hash);

      expect(rpcMock.call).toHaveBeenCalledWith('work_generate', { hash });
      expect(result).toEqual(generatedWork);
    });
  });
});
