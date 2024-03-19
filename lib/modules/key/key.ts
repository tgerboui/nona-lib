import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { Keys } from './key-schema';

export class Key extends RpcConsummer {
  async create(): Promise<Keys> {
    const keys = await this.rpc.call('key_create');

    return this.parseHandler(keys, Keys);
  }

  async expand(key: string): Promise<Keys> {
    const expandedKey = await this.rpc.call('key_expand', {
      key,
    });

    return this.parseHandler(expandedKey, Keys);
  }
}
