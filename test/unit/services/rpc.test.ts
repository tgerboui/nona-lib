import { AxiosError, AxiosInstance } from 'axios';

import { Rpc } from '../../../lib/services/rpc/rpc';
import { NonaNetworkError } from '../../../lib/shared/errors/network-error';
import { NonaError } from '../../../lib/shared/errors/nona-error';
import { NonaRpcError } from '../../../lib/shared/errors/rpc-error';

describe('Rpc', () => {
  let rpc: Rpc;
  const axiosPostMock = jest.fn();
  const axiosInstanceMock = { post: axiosPostMock } as unknown as AxiosInstance;
  const url = 'http://example.com';

  beforeEach(() => {
    rpc = new Rpc({ url });
    rpc['instance'] = axiosInstanceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance of Rpc', () => {
    expect(rpc).toBeInstanceOf(Rpc);
  });

  it('should make an RPC call', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const responseData = { result: 'success' };
    const response = { data: responseData };

    axiosPostMock.mockResolvedValue(response);

    const result = await rpc.call(action, body);

    expect(axiosPostMock).toHaveBeenCalledWith('/', {
      action,
      ...body,
    });
    expect(result).toBe(responseData);
  });

  it('should handle RPC response data error', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const error = 'Some error message';
    const response = { data: { error } };

    axiosPostMock.mockResolvedValue(response);

    await expect(rpc.call(action, body)).rejects.toThrow(NonaRpcError);
    await expect(rpc.call(action, body)).rejects.toThrow(error);
  });

  it('should handle RPC name service error', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const message = 'Some error message';
    const response = { data: { error: 500, message } };

    axiosPostMock.mockResolvedValue(response);

    await expect(rpc.call(action, body)).rejects.toThrow(NonaRpcError);
    await expect(rpc.call(action, body)).rejects.toThrow(message);
  });

  it('should handle RPC response with unknown data format error', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const response = { data: { error: { message: 'Error' } } };

    axiosPostMock.mockResolvedValue(response);

    await expect(rpc.call(action, body)).rejects.toThrow(NonaRpcError);
    await expect(rpc.call(action, body)).rejects.toThrow('Unknown error occurred from RPC call');
  });

  it('should handle network error', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const error = new AxiosError('Network error');

    axiosPostMock.mockRejectedValue(error);

    await expect(rpc.call(action, body)).rejects.toThrow(NonaNetworkError);
    await expect(rpc.call(action, body)).rejects.toThrow(error.message);
  });

  it('should handle unknown error', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const error = new Error('Unknown error');

    axiosPostMock.mockRejectedValue(error);

    await expect(rpc.call(action, body)).rejects.toThrow(NonaError);
    await expect(rpc.call(action, body)).rejects.toThrow(error.message);
  });
});
