import { NameService } from '../../../lib/services/name/name-service';
import { Rpc } from '../../../lib/services/rpc/rpc';
import { NonaParseError } from '../../../lib/shared/errors/parse-error';
import { NonaUserError } from '../../../lib/shared/errors/user-error';
import { NanoTarget } from '../../../lib/shared/utils/address';

jest.mock('../../../lib/services/rpc/rpc');

describe('NameService', () => {
  let nameService: NameService;
  let rpcMock: jest.Mocked<Rpc>;

  beforeEach(() => {
    rpcMock = new Rpc({ url: 'http://example.com' }) as jest.Mocked<Rpc>;
    nameService = new NameService(rpcMock);
  });

  it('should initialize properties correctly', () => {
    expect(nameService['rpc']).toBe(rpcMock);
  });

  describe('resolveUsername', () => {
    it('should resolve a valid username', async () => {
      const username = '@alice';
      const address = 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys';

      rpcMock.call.mockResolvedValue({
        key: '351B53345493B1F3D05980354C6D41ED32BEFEB2664834B95B7DA06292D9D023',
      });
      const resolvedAddress = await nameService.resolveUsername(username);
      expect(resolvedAddress).toEqual(address);
      expect(rpcMock.call).toHaveBeenCalledTimes(1);
      expect(rpcMock.call).toHaveBeenCalledWith('account_key', { account: username });
    });

    it('should not resolve an invalid username', async () => {
      const username = '@alice';

      rpcMock.call.mockResolvedValue({
        error: 500,
        message: 'Username @alice not registered.',
      });

      try {
        await nameService.resolveUsername(username);
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(NonaParseError);
      }
    });
  });

  describe('resolveTarget', () => {
    it('should not try to resolve a valid nano address', async () => {
      const target = 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys';
      jest.spyOn(nameService, 'resolveUsername');

      const resolvedAddress = await nameService.resolveTarget(target);

      expect(resolvedAddress).toEqual(target);
      expect(nameService.resolveUsername).not.toHaveBeenCalled();
    });

    it('should try resolve an username', async () => {
      const target = '@alice';
      const address = 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys';

      jest.spyOn(nameService, 'resolveUsername').mockResolvedValue(address);

      const resolvedAddress = await nameService.resolveTarget(target);

      expect(resolvedAddress).toEqual(address);
      expect(nameService.resolveUsername).toHaveBeenCalledWith(target);
    });

    it('should fail on invalid target', async () => {
      const target = 'invalid';

      try {
        await nameService.resolveTarget(target as NanoTarget);
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(NonaUserError);
      }
    });
  });
});
