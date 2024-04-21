import axios, { AxiosInstance } from 'axios';

import { NonaRpcError } from '../../shared/errors/rpc-error';
import { ErrorService } from '../error/error-service';
import { RpcPostResponse } from './rpc-interface';

export class Rpc {
  private instance: AxiosInstance;

  constructor({ url }: { url: string }) {
    this.instance = axios.create({
      baseURL: url,
    });
  }

  /**
   * Makes an RPC call to the node.
   * @param action - The action to be performed.
   * @param body - The optional request body.
   * @returns A Promise that resolves to the response data.
   */
  public async call(action: string, body?: object): Promise<unknown> {
    try {
      const { data } = await this.instance.post<RpcPostResponse>('/', {
        action,
        ...body,
      });

      if (data.error) {
        this.handleResponseDataError(data.error);
      }

      return data as unknown;
    } catch (error) {
      ErrorService.handleError(error);
    }
  }

  private handleResponseDataError(error: unknown): never {
    if (typeof error === 'string') {
      throw new NonaRpcError(error);
    }

    throw new NonaRpcError('Unknown error occurred from RPC call');
  }
}
