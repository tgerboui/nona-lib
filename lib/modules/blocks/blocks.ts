import { hashBlock, signBlock } from 'nanocurrency';

import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import {
  SignedBlock,
  BlockProcessSubtype,
  BlockSignParams,
  CreateBlockParams,
  HashBlockParams,
} from './blocks-interface';
import { BlockCount, BlockInfo, BlockProcess } from './blocks-schema';

export class Blocks extends RpcConsummer {
  /**
   * Reports the number of blocks in the ledger and unchecked synchronizing blocks
   *
   * @returns A promise that resolves to the count, unchecked and cemtented blocks
   */
  public async count(): Promise<BlockCount> {
    const count = await this.rpc.call('block_count');

    return BlockCount.parse(count);
  }

  /**
   * Returns a formated block with the hash and the signature of the block.
   *
   * @param params - The options for creating the block.
   * @returns A promise that resolves to the created block.
   */
  public create(params: CreateBlockParams): SignedBlock {
    const { privateKey, ...unsignedBlock } = params;

    const hash = this.hash(unsignedBlock);
    const signature = this.sign({
      hash,
      privateKey,
    });

    const block = {
      ...unsignedBlock,
      type: 'state',
      signature,
    };

    return block;
  }

  /**
   * Publish block to the network
   *
   * @param block - The block to publish
   * @param subtype - The subtype of the block
   * @returns A promise that resolves to the hash of the published block
   */
  public async process(block: SignedBlock, subtype: BlockProcessSubtype): Promise<string> {
    const res = await this.rpc.call('process', {
      json_block: 'true',
      subtype,
      block,
    });

    return this.parseHandler(res, BlockProcess).hash;
  }

  /**
   * Retrieves information about a specific block.
   *
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

  /**
   * Create and process a receive block.
   *
   * @param block - The block to be received.
   * @returns A promise that resolves to the hash of the published block
   */
  public receiveBlock(block: CreateBlockParams): Promise<string> {
    const createdBlock = this.create(block);

    return this.process(createdBlock, 'receive');
  }

  /**
   * Get the hash of a block
   *
   * @param block
   * @returns
   */
  public hash(block: HashBlockParams): string {
    let previous = block.previous;
    if (previous === '0') {
      previous = '0000000000000000000000000000000000000000000000000000000000000000';
    }

    return hashBlock({
      ...block,
      previous,
    });
  }

  /**
   * Signs a block using the provided hash and private key.
   *
   * @param params - The parameters required for signing the block.
   * @returns The signed block.
   */
  public sign({ hash, privateKey }: BlockSignParams): string {
    return signBlock({
      hash,
      secretKey: privateKey,
    });
  }
}
