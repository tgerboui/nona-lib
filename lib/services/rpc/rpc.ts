import axios, { AxiosInstance } from 'axios';

export class Rpc {
  instance: AxiosInstance;

  constructor({ url }: { url: string }) {
    this.instance = axios.create({
      baseURL: url,
    });
  }

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
