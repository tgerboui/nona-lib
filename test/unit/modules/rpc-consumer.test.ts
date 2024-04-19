import { z } from 'zod';

import { RpcConsummer } from '../../../lib/modules/rpc-consumer/rpc-consumer';
import { Rpc } from '../../../lib/services/rpc/rpc';
import { NonaParseError } from '../../../lib/shared/errors/parse-error';

describe('RpcConsumer', () => {
  let rpcConsumer: RpcConsummer;
  let rpcMock: Rpc;

  beforeEach(() => {
    rpcMock = {} as Rpc;
    rpcConsumer = new RpcConsummer(rpcMock);
  });

  it('should initialize properties correctly', () => {
    expect(rpcConsumer['rpc']).toBe(rpcMock);
  });

  describe('parseHandler', () => {
    it('should return parsed data when schema is valid', () => {
      const data = { name: 'John', age: 30 };
      const schema = z.object({ name: z.string(), age: z.number() });

      const result = rpcConsumer.parseHandler(data, schema);

      expect(result).toEqual(data);
    });

    it('should throw a NonaParseError if the schema is invalid', () => {
      const data = { name: 'John', age: '30' };
      const schema = z.object({ name: z.string(), age: z.number() });

      try {
        rpcConsumer.parseHandler(data, schema);
        // If the function does not throw an error, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NonaParseError);
      }
    });
  });
});
