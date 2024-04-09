import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { Telemetry, Version, uptimeSchema } from './node-schema';

export class Node extends RpcConsummer {
  public async telemetry(): Promise<Telemetry> {
    const res = await this.rpc.call('telemetry');
    return this.parseHandler(res, Telemetry);
  }

  /// Return the number of seconds the node has been running
  public async uptime(): Promise<string> {
    const res = await this.rpc.call('uptime');
    return this.parseHandler(res, uptimeSchema).seconds;
  }

  public async version(): Promise<Version> {
    const res = await this.rpc.call('version');
    return this.parseHandler(res, Version);
  }
}
