import { deriveAddress, derivePublicKey, deriveSecretKey } from 'nanocurrency';

import { Nona } from '../../lib/modules/nona';
import { Rpc } from '../../lib/services/rpc/rpc';

describe('Nona', () => {
  let nona: Nona;
  const mockRpcCall = jest.fn();
  const mockRemoteProcedureCall = { call: mockRpcCall };
  const seed = 'cca6fda2102c958239b2e0f02e688414c23939271b7bcfe0d5014ab246071c12';
  const privateKey = deriveSecretKey(seed, 0);
  const publicKey = derivePublicKey(privateKey);
  const address = deriveAddress(publicKey, { useNanoPrefix: true });

  beforeEach(() => {
    nona = new Nona();
    nona['remoteProcedureCall'] = mockRemoteProcedureCall as unknown as Rpc;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance of Nona', () => {
    expect(nona).toBeInstanceOf(Nona);
  });

  it('should initialize properties correctly', () => {
    expect(nona.ws).toBeDefined();
    expect(nona.blocks).toBeDefined();
    expect(nona.key).toBeDefined();
    expect(nona.node).toBeDefined();
  });

  it('should create an instance of Account', () => {
    const account = nona.account(address);
    expect(account).toBeDefined();
    expect(account.address).toBe(address);
  });

  it('should create an instance of Wallet', () => {
    const wallet = nona.wallet(privateKey);

    expect(wallet).toBeDefined();
    expect(wallet.publicKey).toBe(publicKey);
    expect(wallet.address).toBe(address);
  });

  it('should make an RPC call', async () => {
    const action = 'someAction';
    const body = { param1: 'value1', param2: 'value2' };
    const response = 'someResponse';

    mockRpcCall.mockResolvedValue(response);

    const result = await nona.rpc(action, body);

    expect(mockRpcCall).toHaveBeenCalledWith(action, body);
    expect(result).toBe(response);
  });
});
