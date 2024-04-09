import { KeyService } from '../../services/hash/key-service';
import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { AccountKeys } from './key-interface';
import { Keys } from './key-schema';

export class Key extends RpcConsummer {
  // TODO: Add options to set seed
  async create(): Promise<AccountKeys> {
    const keys = await this.rpc.call('key_create');

    const parsedKeys = this.parseHandler(keys, Keys);

    return {
      privateKey: parsedKeys.private,
      publicKey: parsedKeys.public,
      account: parsedKeys.account,
    };
  }

  async expand(privateKey: string): Promise<AccountKeys> {
    return {
      privateKey: privateKey,
      publicKey: KeyService.getPublicKey(privateKey),
      account: KeyService.getAddress(KeyService.getPublicKey(privateKey)),
    };
  }
}
