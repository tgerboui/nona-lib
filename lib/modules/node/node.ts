import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { Telemetry, Version, uptimeSchema } from './node-schema';

/**
 * Handle all node and network related operations
 * @class
 */
export class Node extends RpcConsummer {
  /**
   * Return metrics from other nodes on the network.
   * Summarized view of the whole network.
   */
  public async telemetry(): Promise<Telemetry> {
    const res = await this.rpc.call('telemetry');
    return this.parseHandler(res, Telemetry);
  }

  /**
   * Return node uptime in seconds
   */
  public async uptime(): Promise<number> {
    const res = await this.rpc.call('uptime');

    const seconds = this.parseHandler(res, uptimeSchema).seconds;
    return parseInt(seconds, 10);
  }

  /**
   * Returns version information for RPC, Store, Protocol (network), Node (Major & Minor version).
   */
  public async version(): Promise<Version> {
    const res = await this.rpc.call('version');
    return this.parseHandler(res, Version);
  }
}
