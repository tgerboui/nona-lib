import { Nona } from '../../lib/modules/nona';

describe('Nona', () => {
  let nona: Nona;
  const privateKey = '822D087562485A63C119E0232C65906C2D789BAB23CAB28ADEFC9202428C3551';
  const publicKey = 'EFAD2349492DA76FEF035FE58D9501142759DA34805EDADCCC8A1B2BA7912067';
  const address = 'nano_3uxf6f6nkdf9fzqi8qz7jpci4739d9f5b14yudges4iu7gms4a59y46mmegz';

  beforeEach(() => {
    nona = new Nona();
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

    nona.rpc = jest.fn().mockResolvedValue(response);

    const result = await nona.rpc(action, body);

    expect(nona.rpc).toHaveBeenCalledWith(action, body);
    expect(result).toBe(response);
  });
});
