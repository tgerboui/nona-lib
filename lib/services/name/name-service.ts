import { RpcConsummer } from '../../modules/rpc-consumer/rpc-consumer';
import { NonaUserError } from '../../shared/errors/user-error';
import {
  NanoAddress,
  NanoTarget,
  NanoUsername,
  isValidNanoAddress,
  isValidNanoUsername,
} from '../../shared/utils/address';
import { KeyService } from '../hash/key-service';
import { Rpc } from '../rpc/rpc';
import { NameInfo } from './name-schemas';

export class NameService extends RpcConsummer {
  constructor(rpc = new Rpc({ url: 'https://rpc.nano.to' })) {
    super(rpc);
  }

  /**
   * Resolves a username registered with the [Nano Name Service](http://nano.to) to a valid {@link NanoAddress}
   *
   * @param username - the {@link NanoUsername} to resolve
   * @returns a promise of the resolve {@link NanoAddress}
   */
  public async resolveUsername(username: NanoUsername): Promise<NanoAddress> {
    const res = await this.rpc.call('account_key', { account: username });
    const { key } = this.parseHandler(res, NameInfo);
    return KeyService.getAddress(key);
  }

  /**
   * Checks if the given target is a valid {@link NanoAddress} or a {@link NanoUsername}, which is resolved to a valid {@link NanoAddress}
   *
   * @param target - the {@link NanoTarget} to resolve
   * @returns the resolve {@link NanoAddress}
   */
  public async resolveTarget(target: NanoTarget): Promise<NanoAddress> {
    if (isValidNanoUsername(target)) {
      return this.resolveUsername(target);
    }
    if (isValidNanoAddress(target)) {
      return target;
    }

    throw new NonaUserError(
      `Invalid target ${target as string}. Should be either username (@*) or address (nano_*)`,
    );
  }
}
