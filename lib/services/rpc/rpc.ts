import axios, { AxiosInstance } from 'axios';

export class Rpc {
  instance: AxiosInstance;

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
  async call(action: string, body?: object): Promise<unknown> {
    // TODO: Handle error
    const res = await this.instance.post('/', {
      action,
      ...body,
    });

    if (res.data.error && res.data.error === 'Unable to parse JSON') {
      // TODO: Better error handling
      throw new Error('Unable to parse JSON');
    }

    return res.data;
  }
}
