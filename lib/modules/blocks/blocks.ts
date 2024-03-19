import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { BlockCount } from './blocks-schema';

export class Blocks extends RpcConsummer {
  async count(): Promise<BlockCount> {
    const count = await this.rpc.call('block_count');

    return BlockCount.parse(count);
  }
}
