import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { Version } from './node-schema';

export class Node extends RpcConsummer {
  public async version(): Promise<Version> {
    const res = await this.rpc.call('version');
    return this.parseHandler(res, Version);
  }
}
