import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { BlockCreateOptions, BlockProcessSubtype } from './blocks-interface';
import { BlockCount, Block, BlockProcess, BlockInfo } from './blocks-schema';

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
  public async process(block: Block['block'], subtype: BlockProcessSubtype): Promise<string> {
    const res = await this.rpc.call('process', {
      json_block: 'true',
      subtype,
      block,
    });

    return this.parseHandler(res, BlockProcess).hash;
  }

  public async info(hash: string): Promise<BlockInfo> {
    const res = await this.rpc.call('block_info', {
      json_block: 'true',
      hash,
    });

    return this.parseHandler(res, BlockInfo);
  }
}
