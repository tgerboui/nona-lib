import { z } from 'zod';
import { Rpc } from '../../services/rpc/rpc';

export class RpcConsummer {
  rpc: Rpc;

  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }

  parseHandler<T>(data: unknown, schema: z.Schema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      // TODO: Better error handling
      throw new Error('Response format');
    }
  }
}
