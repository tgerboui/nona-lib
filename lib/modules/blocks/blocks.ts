import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { BlockProcessSubtype, CreateBlockParams } from './blocks-interface';
import { Block, BlockCount, BlockInfo, BlockProcess } from './blocks-schema';

export class Blocks extends RpcConsummer {
  /**
   * Reports the number of blocks in the ledger and unchecked synchronizing blocks
   * @returns A promise that resolves to the count, unchecked and cemtented blocks
   */
  async count(): Promise<BlockCount> {
    const count = await this.rpc.call('block_count');

    return BlockCount.parse(count);
  }

  /**
   * Creates a new block based on input data & signed with private key or account in wallet.
   * @param params - The options for creating the block.
   * @returns A promise that resolves to the created block.
   */
  public async create(params: CreateBlockParams): Promise<Block['block']> {
    const res = await this.rpc.call('block_create', {
      json_block: 'true',
      type: 'state',
      ...params,
    });

    return this.parseHandler(res, Block).block;
  }

  /**
   * Publish block to the network
   * @param block - The block to publish
   * @param subtype - The subtype of the block
   * @returns A promise that resolves to the hash of the published block
   */
  public async process(block: Block['block'], subtype: BlockProcessSubtype): Promise<string> {
    const res = await this.rpc.call('process', {
      json_block: 'true',
      subtype,
      block,
    });

    return this.parseHandler(res, BlockProcess).hash;
  }

  /**
   * Retrieves information about a specific block.
   * @param hash The hash of the block to retrieve information for.
   * @returns A promise that resolves to an object containing the block information.
   */
  public async info(hash: string): Promise<BlockInfo> {
    const res = await this.rpc.call('block_info', {
      json_block: 'true',
      hash,
    });

    return this.parseHandler(res, BlockInfo);
  }
}
