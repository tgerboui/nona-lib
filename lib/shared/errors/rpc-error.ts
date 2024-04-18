import { NonaError } from './nona-error';

/**
 * An error that occurs during RPC operations in the Nona application.
 */
export class NonaRpcError extends NonaError {
  constructor(message: string) {
    super(message);
    this.name = 'RpcError';
  }
}
