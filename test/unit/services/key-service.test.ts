import { deriveAddress, derivePublicKey, deriveSecretKey, generateSeed } from 'nanocurrency';

import { KeyService } from '../../../lib/services/hash/key-service';

jest.mock('nanocurrency', () => ({
  generateSeed: jest.fn(),
  deriveSecretKey: jest.fn(),
  derivePublicKey: jest.fn(),
  deriveAddress: jest.fn(),
}));

describe('KeyService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a seed', async () => {
    const seed = 'cca6fda2102c958239b2e0f02e688414c23939271b7bcfe0d5014ab246071c12';
    (generateSeed as jest.Mock).mockResolvedValue(seed);

    const result = await KeyService.generateSeed();

    expect(generateSeed).toHaveBeenCalled();
    expect(result).toBe(seed);
  });

  it('should derive a private key', () => {
    const seed = 'cca6fda2102c958239b2e0f02e688414c23939271b7bcfe0d5014ab246071c12';
    const index = 0;
    const secretKey = 'secretKey123';
    (deriveSecretKey as jest.Mock).mockReturnValue(secretKey);

    const result = KeyService.getPrivateKey(seed, index);

    expect(deriveSecretKey).toHaveBeenCalledWith(seed, index);
    expect(result).toBe(secretKey);
  });

  it('should derive a public key', () => {
    const privateKey = 'privateKey123';
    const publicKey = 'publicKey123';
    (derivePublicKey as jest.Mock).mockReturnValue(publicKey);

    const result = KeyService.getPublicKey(privateKey);

    expect(derivePublicKey).toHaveBeenCalledWith(privateKey);
    expect(result).toBe(publicKey);
  });

  it('should derive an address', () => {
    const publicKey = 'publicKey123';
    const address = 'nano_123abc';
    (deriveAddress as jest.Mock).mockReturnValue(address);

    const result = KeyService.getAddress(publicKey);

    expect(deriveAddress).toHaveBeenCalledWith(publicKey, { useNanoPrefix: true });
    expect(result).toBe(address);
  });
});
