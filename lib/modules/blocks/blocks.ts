import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { BlockCreateOptions } from './blocks-interface';
import { BlockCount, Block, BlockProcess } from './blocks-schema';

export class Blocks extends RpcConsummer {
  async count(): Promise<BlockCount> {
    const count = await this.rpc.call('block_count');

    return BlockCount.parse(count);
  }

  public async create(options: BlockCreateOptions): Promise<Block['block']> {
    const res = await this.rpc.call('block_create', {
      json_block: 'true',
      type: 'state',
      ...options,
    });

    return this.parseHandler(res, Block).block;
  }

  /// Return the hash of the block
  public async process(block: Block['block']): Promise<string> {
    const res = await this.rpc.call('process', {
      json_block: 'true',
      subtype: 'open',
      block,
    });

    return this.parseHandler(res, BlockProcess).hash;
  }
}
