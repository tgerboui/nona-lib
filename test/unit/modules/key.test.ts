import { Key } from '../../../lib/modules/key/key';
import { KeyService } from '../../../lib/services/hash/key-service';

jest.mock('../../../lib/services/hash/key-service');

describe('Key', () => {
  const keyServiceMock = KeyService as jest.Mocked<typeof KeyService>;
  let key: jest.Mocked<Key>;

  beforeEach(() => {
    key = new Key() as jest.Mocked<Key>;
  });

  describe('create', () => {
    it('should generate keys from provided seed', async () => {
      const seed = 'test-seed';
      const privateKey = 'privateKey';
      const publicKey = 'publicKey';
      const address = 'nano_address';

      keyServiceMock.getPrivateKey.mockReturnValue(privateKey);
      keyServiceMock.getPublicKey.mockReturnValue(publicKey);
      keyServiceMock.getAddress.mockReturnValue(address);

      const result = await key.create(seed);
      expect(keyServiceMock.getPrivateKey).toHaveBeenCalledWith(seed, 0);
      expect(keyServiceMock.getPublicKey).toHaveBeenCalledWith(privateKey);
      expect(keyServiceMock.getAddress).toHaveBeenCalledWith(publicKey);
      expect(result).toEqual({ privateKey, publicKey, address });
    });

    it('should generate keys from a new seed if none is provided', async () => {
      const generatedSeed = 'generated-seed';
      const privateKey = 'privateKey';
      const publicKey = 'publicKey';
      const address = 'nano_address';

      keyServiceMock.generateSeed.mockResolvedValue(generatedSeed);
      keyServiceMock.getPrivateKey.mockReturnValue(privateKey);
      keyServiceMock.getPublicKey.mockReturnValue(publicKey);
      keyServiceMock.getAddress.mockReturnValue(address);

      const result = await key.create();
      expect(keyServiceMock.generateSeed).toHaveBeenCalled();
      expect(keyServiceMock.getPrivateKey).toHaveBeenCalledWith(generatedSeed, 0);
      expect(keyServiceMock.getPublicKey).toHaveBeenCalledWith(privateKey);
      expect(keyServiceMock.getAddress).toHaveBeenCalledWith(publicKey);
      expect(result).toEqual({ privateKey, publicKey, address });
    });
  });

  describe('expand', () => {
    it('should expand private key to public key and address', () => {
      const privateKey = 'privateKey';
      const publicKey = 'publicKey';
      const address = 'nano_address';

      keyServiceMock.getPublicKey.mockReturnValue(publicKey);
      keyServiceMock.getAddress.mockReturnValue(address);

      const result = key.expand(privateKey);
      expect(keyServiceMock.getPublicKey).toHaveBeenCalledWith(privateKey);
      expect(keyServiceMock.getAddress).toHaveBeenCalledWith(publicKey);
      expect(result).toEqual({ publicKey, address });
    });
  });
});
