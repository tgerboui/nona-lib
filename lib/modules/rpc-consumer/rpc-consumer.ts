import { z } from 'zod';

import { ErrorService } from '../../services/error/error-service';
import { Rpc } from '../../services/rpc/rpc';

export class RpcConsummer {
  constructor(protected rpc: Rpc) {}

  public parseHandler<T extends z.Schema>(data: unknown, schema: T): z.output<T> {
    try {
      return schema.parse(data);
    } catch (error) {
      ErrorService.handleError(error);
    }
  }
}
