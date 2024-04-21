import { z } from 'zod';

import { ErrorService } from '../../services/error/error-service';
import { Rpc } from '../../services/rpc/rpc';

export class RpcConsummer {
  constructor(protected rpc: Rpc) {}

  public parseHandler<T extends z.ZodType<unknown>>(data: unknown, schema: T): z.infer<T> {
    try {
      return schema.parse(data);
    } catch (error) {
      ErrorService.handleError(error);
    }
  }
}
