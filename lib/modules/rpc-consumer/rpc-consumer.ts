import { z } from 'zod';
import { Rpc } from '../../services/rpc/rpc';
import { rpcError } from './rpc-consumer-schema';

export class RpcConsummer {
  rpc: Rpc;

  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }

  // TODO: Create class for errors
  parseHandler<T>(data: unknown, schema: z.Schema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Rpc error
        const parsedError = rpcError.safeParse(data);
        if (parsedError.success) {
          throw new Error(parsedError.data.error);
        }
      }
      // TODO: Better error handling
      throw new Error('Response format');
    }
  }
}
