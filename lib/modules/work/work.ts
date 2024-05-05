import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { WorkGenerate } from './work-schema';

// TODO: Handle local and server work generation
export class Work extends RpcConsummer {
  /**
   * Generates proof of work for a given hash.
   *
   * @param hash - The hash for which to generate the work.
   * @returns A Promise that resolves to the generated work.
   */
  public async generate(hash: string): Promise<WorkGenerate> {
    const res = await this.rpc.call('work_generate', {
      hash,
    });

    return this.parseHandler(res, WorkGenerate);
  }
}
